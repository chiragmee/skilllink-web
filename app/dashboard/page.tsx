'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'
import Toast from '@/components/Toast'
import { listBookings, acceptBooking, cancelBooking, completeBooking, type Booking } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

const STATUS_LABEL: Record<string, string> = {
  requested: 'Requested',
  accepted: 'Awaiting Payment',
  pending_payment: 'Awaiting Payment',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
}

const STATUS_COLOR: Record<string, string> = {
  requested: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-blue-100 text-blue-700',
  pending_payment: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-zinc-100 text-zinc-600',
  cancelled: 'bg-red-100 text-red-600',
  no_show: 'bg-orange-100 text-orange-700',
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [tab, setTab] = useState<'upcoming' | 'all'>('upcoming')
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const fetchBookings = useCallback(async () => {
    setFetchError('')
    try {
      const data = await listBookings('expert')
      setBookings(Array.isArray(data) ? data : [])
    } catch {
      setFetchError('Could not load bookings. Please refresh.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return }
    if (!authLoading && user && !user.expertProfileId) { router.replace('/register-expert'); return }
    if (user?.expertProfileId) fetchBookings()
  }, [user, authLoading, router, fetchBookings])

  const upcoming = bookings.filter(b => ['requested', 'accepted', 'pending_payment', 'confirmed'].includes(b.status))
  const earnings = bookings
    .filter(b => ['confirmed', 'completed'].includes(b.status) && b.payment?.status === 'captured')
    .reduce((sum, b) => sum + (b.payment?.amount || 0), 0)

  const displayed = tab === 'upcoming' ? upcoming : bookings

  async function handleAction(bookingId: string, action: 'accept' | 'cancel' | 'complete') {
    setSubmitting(bookingId)
    try {
      if (action === 'accept') await acceptBooking(bookingId)
      else if (action === 'cancel') await cancelBooking(bookingId, 'Cancelled by expert')
      else if (action === 'complete') await completeBooking(bookingId)
      await fetchBookings()
      const msgs = {
        accept: 'Booking accepted! Learner will be notified.',
        cancel: 'Booking cancelled.',
        complete: 'Session marked as complete!',
      }
      setToast({ message: msgs[action], type: action === 'cancel' ? 'info' : 'success' })
    } catch (err: any) {
      setToast({ message: err.message || 'Action failed. Please try again.', type: 'error' })
    } finally {
      setSubmitting(null)
    }
  }

  if (loading || authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="bg-surface min-h-screen pb-28">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <TopBar variant="home" />
      <main className="mt-20 max-w-2xl mx-auto px-4">
        <div className="py-4 flex items-center justify-between">
          <div>
            <p className="text-on-surface-variant text-sm">Welcome back,</p>
            <h1 className="text-2xl font-bold">{user?.name || 'Expert'}</h1>
          </div>
          <button onClick={fetchBookings} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors">
            <span className="material-symbols-outlined text-zinc-400">refresh</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-zinc-100 text-center">
            <p className="text-2xl font-extrabold text-primary">&#8377;{(earnings / 100).toLocaleString('en-IN')}</p>
            <p className="text-zinc-500 text-xs mt-1">Earnings</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-zinc-100 text-center">
            <p className="text-2xl font-extrabold text-primary">{upcoming.length}</p>
            <p className="text-zinc-500 text-xs mt-1">Upcoming</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-zinc-100 text-center">
            <p className="text-2xl font-extrabold text-primary">{bookings.filter(b => b.status === 'completed').length}</p>
            <p className="text-zinc-500 text-xs mt-1">Completed</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {(['upcoming', 'all'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={'px-4 py-2 rounded-xl font-semibold text-sm transition-colors ' +
                (tab === t ? 'bg-primary text-white' : 'bg-white border border-zinc-200 text-on-surface-variant')}>
              {t === 'upcoming' ? `Upcoming${upcoming.length > 0 ? ` (${upcoming.length})` : ''}` : 'All Bookings'}
            </button>
          ))}
        </div>

        {/* Error */}
        {fetchError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex items-center justify-between">
            <p className="text-red-700 text-sm">{fetchError}</p>
            <button onClick={fetchBookings} className="text-red-600 font-semibold text-sm ml-4">Retry</button>
          </div>
        )}

        {/* Empty state */}
        {displayed.length === 0 && !fetchError && (
          <div className="text-center py-12 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-4 block">calendar_today</span>
            <p className="font-semibold">
              {tab === 'upcoming' ? 'No upcoming bookings' : 'No bookings yet'}
            </p>
            <p className="text-sm mt-1 text-zinc-400">
              {tab === 'upcoming'
                ? 'New bookings from learners will appear here'
                : 'Bookings will show here once learners start booking you'}
            </p>
          </div>
        )}

        {/* Booking cards */}
        <div className="space-y-4">
          {displayed.map(b => {
            const learnerName = b.learner?.name || 'Learner'
            const slotDate = new Date(b.slotDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
            const isPending = submitting === b.id
            return (
              <div key={b.id} className="bg-white rounded-2xl p-5 border border-zinc-100">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold">{learnerName}</p>
                    <p className="text-zinc-500 text-sm">{slotDate} · {b.slotStart} – {b.slotEnd}</p>
                  </div>
                  <span className={'text-xs font-semibold px-2 py-1 rounded-full ' + (STATUS_COLOR[b.status] || 'bg-zinc-100 text-zinc-600')}>
                    {STATUS_LABEL[b.status] || b.status}
                  </span>
                </div>
                {b.pricing && (
                  <p className="text-sm text-zinc-400 mb-3">
                    ₹{(b.pricing.amount / 100).toLocaleString('en-IN')} · {b.pricing.durationMins} min · <span className="capitalize">{b.mode}</span>
                  </p>
                )}
                <div className="flex gap-2 flex-wrap">
                  {b.status === 'requested' && (
                    <>
                      <button onClick={() => handleAction(b.id, 'accept')} disabled={isPending}
                        className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold disabled:opacity-50">
                        {isPending ? 'Accepting…' : 'Accept'}
                      </button>
                      <button onClick={() => handleAction(b.id, 'cancel')} disabled={isPending}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-200 disabled:opacity-50">
                        Reject
                      </button>
                    </>
                  )}
                  {b.status === 'confirmed' && (
                    <button onClick={() => handleAction(b.id, 'complete')} disabled={isPending}
                      className="px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-semibold border border-green-200 disabled:opacity-50">
                      {isPending ? 'Updating…' : 'Mark Complete'}
                    </button>
                  )}
                  {['requested', 'accepted', 'confirmed'].includes(b.status) && (
                    <button onClick={() => handleAction(b.id, 'cancel')} disabled={isPending}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-200 disabled:opacity-50">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>
      <BottomNav mode="expert" />
    </div>
  )
}
