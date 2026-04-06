'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'
import { listBookings, acceptBooking, cancelBooking, completeBooking, type Booking } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'upcoming'|'all'>('upcoming')
  const [submitting, setSubmitting] = useState<string|null>(null)

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return }
    if (!authLoading && user && !user.expertProfileId) { router.replace('/register-expert'); return }
    if (user?.expertProfileId) {
      listBookings('expert').then(setBookings).catch(console.error).finally(() => setLoading(false))
    }
  }, [user, authLoading, router])

  const upcoming = bookings.filter(b => ['accepted','pending_payment','confirmed'].includes(b.status))
  const earnings = bookings
    .filter(b => ['confirmed','completed'].includes(b.status) && b.payment?.status === 'captured')
    .reduce((sum, b) => sum + (b.payment?.amount || 0), 0)

  const displayed = tab === 'upcoming' ? upcoming : bookings

  async function handleAction(bookingId: string, action: 'accept'|'cancel'|'complete') {
    setSubmitting(bookingId)
    try {
      if (action === 'accept') await acceptBooking(bookingId)
      else if (action === 'cancel') await cancelBooking(bookingId, 'Cancelled by expert')
      else if (action === 'complete') await completeBooking(bookingId)
      const updated = await listBookings('expert')
      setBookings(updated)
    } catch (err: any) { alert(err.message) }
    finally { setSubmitting(null) }
  }

  if (loading || authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="bg-surface min-h-screen pb-28">
      <TopBar variant="home" />
      <main className="mt-20 max-w-2xl mx-auto px-4">
        <div className="py-4">
          <p className="text-on-surface-variant text-sm">Welcome back,</p>
          <h1 className="text-2xl font-bold">{user?.name || 'Expert'}</h1>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-zinc-100 text-center">
            <p className="text-2xl font-extrabold text-primary">&#8377;{(earnings/100).toLocaleString('en-IN')}</p>
            <p className="text-zinc-500 text-xs mt-1">Earnings</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-zinc-100 text-center">
            <p className="text-2xl font-extrabold text-primary">{upcoming.length}</p>
            <p className="text-zinc-500 text-xs mt-1">Upcoming</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-zinc-100 text-center">
            <p className="text-2xl font-extrabold text-primary">{bookings.filter(b=>b.status==='completed').length}</p>
            <p className="text-zinc-500 text-xs mt-1">Completed</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {(['upcoming','all'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={'px-4 py-2 rounded-xl font-semibold text-sm capitalize transition-colors ' +
                (tab===t ? 'bg-primary text-white' : 'bg-white border border-zinc-200 text-on-surface-variant')}>
              {t === 'upcoming' ? 'Upcoming' : 'All Bookings'}
            </button>
          ))}
        </div>

        {displayed.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-4 block">calendar_today</span>
            <p className="font-semibold">No bookings yet</p>
            <p className="text-sm mt-1">Your bookings will appear here once learners start booking</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayed.map(b => {
              const learnerName = b.learner?.name || 'Learner'
              const slotDate = new Date(b.slotDate).toLocaleDateString('en-IN', {day:'2-digit',month:'short'})
              const isPending = submitting === b.id
              return (
                <div key={b.id} className="bg-white rounded-2xl p-5 border border-zinc-100">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold">{learnerName}</p>
                      <p className="text-zinc-500 text-sm">{slotDate} · {b.slotStart} – {b.slotEnd}</p>
                    </div>
                    <span className={'text-xs font-semibold px-2 py-1 rounded-full capitalize ' +
                      (b.status==='confirmed'?'bg-green-100 text-green-700':
                       b.status==='accepted'?'bg-blue-100 text-blue-700':
                       b.status==='completed'?'bg-zinc-100 text-zinc-600':
                       'bg-red-100 text-red-600')}>
                      {b.status.replace('_',' ')}
                    </span>
                  </div>
                  {b.pricing && <p className="text-sm text-zinc-400 mb-3">₹{(b.pricing.amount/100).toLocaleString('en-IN')} · {b.pricing.durationMins} min</p>}
                  <div className="flex gap-2">
                    {b.status === 'requested' && (
                      <>
                        <button onClick={() => handleAction(b.id,'accept')} disabled={isPending}
                          className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold">
                          Accept
                        </button>
                        <button onClick={() => handleAction(b.id,'cancel')} disabled={isPending}
                          className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-200">
                          Reject
                        </button>
                      </>
                    )}
                    {b.status === 'confirmed' && (
                      <button onClick={() => handleAction(b.id,'complete')} disabled={isPending}
                        className="px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-semibold border border-green-200">
                        Mark Complete
                      </button>
                    )}
                    {['accepted','confirmed'].includes(b.status) && (
                      <button onClick={() => handleAction(b.id,'cancel')} disabled={isPending}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-200">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
      <BottomNav mode="expert" />
    </div>
  )
}
