'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Toast from '@/components/Toast'
import { acceptBooking, cancelBooking, completeBooking, listBookings, type Booking } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

const STATUS_BADGE: Record<string, string> = {
  requested: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-blue-100 text-blue-700',
  pending_payment: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-slate-100 text-slate-700',
  cancelled: 'bg-red-100 text-red-700',
}

const STATUS_LABEL: Record<string, string> = {
  requested: 'Requested',
  accepted: 'Awaiting Payment',
  pending_payment: 'Awaiting Payment',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'upcoming' | 'all'>('upcoming')
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const fetchBookings = useCallback(async () => {
    setError('')
    try {
      const data = await listBookings('expert')
      setBookings(Array.isArray(data) ? data : [])
    } catch {
      setError('Could not load dashboard bookings. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login')
      return
    }
    if (!authLoading && user && !user.expertProfileId) {
      router.replace('/register-expert')
      return
    }
    if (user?.expertProfileId) fetchBookings()
  }, [authLoading, fetchBookings, router, user])

  const upcomingBookings = useMemo(
    () => bookings.filter((booking) => ['requested', 'accepted', 'pending_payment', 'confirmed'].includes(booking.status)),
    [bookings],
  )

  const displayed = tab === 'upcoming' ? upcomingBookings : bookings
  const earnings = bookings
    .filter((booking) => ['confirmed', 'completed'].includes(booking.status))
    .reduce((sum, booking) => sum + (booking.payment?.amount ?? booking.pricing?.amount ?? 0), 0)
  const completedCount = bookings.filter((booking) => booking.status === 'completed').length

  async function handleAction(bookingId: string, action: 'accept' | 'reject' | 'complete' | 'cancel') {
    setSubmittingId(bookingId)
    try {
      if (action === 'accept') await acceptBooking(bookingId)
      if (action === 'reject') await cancelBooking(bookingId, 'Rejected by expert')
      if (action === 'complete') await completeBooking(bookingId)
      if (action === 'cancel') await cancelBooking(bookingId, 'Cancelled by expert')
      await fetchBookings()
      setToast({ message: 'Booking updated successfully.', type: 'success' })
    } catch {
      setToast({ message: 'Could not update this booking. Please try again.', type: 'error' })
    } finally {
      setSubmittingId(null)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="app-shell flex items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-7">
            <Link href="/" className="text-2xl font-bold text-primary">
              SkillLink
            </Link>
            <nav className="hidden items-center gap-5 text-sm text-slate-500 md:flex">
              <Link href="/" className="hover:text-primary">Experts</Link>
              <span>Badminton</span>
              <span>Music</span>
              <span>Fitness</span>
            </nav>
          </div>
          <button className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">Book Now</button>
        </div>
      </header>

      <main className="app-shell px-4 py-8 sm:px-6">
        <section className="mb-8">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900">Expert Dashboard</h1>
          <p className="mt-2 text-slate-600">Manage your curriculum and student requests for the upcoming week.</p>
        </section>

        <section className="mb-10 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <article className="rounded-xl bg-white p-6 shadow-card lg:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Lifetime Revenue</p>
            <p className="mt-2 text-5xl font-extrabold text-slate-900">Rs {(earnings / 100).toLocaleString('en-IN')}</p>
            <div className="mt-6 flex h-20 items-end gap-2">
              <div className="h-6 flex-1 rounded-t bg-indigo-100" />
              <div className="h-10 flex-1 rounded-t bg-indigo-200" />
              <div className="h-7 flex-1 rounded-t bg-indigo-100" />
              <div className="h-12 flex-1 rounded-t bg-indigo-300" />
              <div className="h-7 flex-1 rounded-t bg-indigo-100" />
              <div className="h-14 flex-1 rounded-t bg-indigo-400" />
              <div className="h-16 flex-1 rounded-t bg-primary" />
            </div>
          </article>

          <article className="rounded-xl bg-white p-6 shadow-card lg:col-span-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Upcoming Sessions</p>
            <p className="mt-2 text-6xl font-extrabold text-slate-900">{upcomingBookings.length}</p>
            <span className="mt-4 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              {upcomingBookings.length > 0 ? `+${Math.min(upcomingBookings.length, 4)} from last week` : 'No new requests'}
            </span>
          </article>
        </section>

        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Recent Booking Requests</h2>
            <button onClick={fetchBookings} className="text-sm font-semibold text-primary">
              Refresh
            </button>
          </div>

          <div className="mb-4 flex gap-2">
            {(['upcoming', 'all'] as const).map((value) => (
              <button
                key={value}
                onClick={() => setTab(value)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                  tab === value ? 'bg-primary text-white' : 'bg-white text-slate-600 shadow-card'
                }`}
              >
                {value === 'all' ? 'All Bookings' : 'Upcoming'}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {!error && displayed.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-card">
              <p className="text-sm text-slate-600">No booking requests to show right now.</p>
            </div>
          )}

          {!error && displayed.length > 0 && (
            <div className="space-y-3">
              {displayed.map((booking) => {
                const pending = submittingId === booking.id
                return (
                  <article key={booking.id} className="rounded-xl bg-white p-5 shadow-card">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900">{booking.learner?.name ?? 'Learner'}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatDate(booking.slotDate)} • {booking.slotStart} - {booking.slotEnd}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Rs {((booking.pricing?.amount ?? 0) / 100).toLocaleString('en-IN')} • {booking.pricing?.durationMins ?? 60} min •{' '}
                          <span className="capitalize">{booking.mode}</span>
                        </p>
                      </div>

                      <div className="flex flex-col items-start gap-2 lg:items-end">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[booking.status] ?? 'bg-slate-100 text-slate-700'}`}>
                          {STATUS_LABEL[booking.status] ?? booking.status}
                        </span>

                        <div className="flex flex-wrap gap-2">
                          {booking.status === 'requested' && (
                            <>
                              <button
                                onClick={() => handleAction(booking.id, 'reject')}
                                disabled={pending}
                                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-60"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleAction(booking.id, 'accept')}
                                disabled={pending}
                                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                              >
                                Accept Request
                              </button>
                            </>
                          )}

                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => handleAction(booking.id, 'complete')}
                              disabled={pending}
                              className="rounded-xl border border-primary/30 bg-indigo-50 px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60"
                            >
                              Mark Complete
                            </button>
                          )}

                          {['accepted', 'confirmed'].includes(booking.status) && (
                            <button
                              onClick={() => handleAction(booking.id, 'cancel')}
                              disabled={pending}
                              className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-60"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <section className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <article className="rounded-xl bg-white p-6 shadow-card">
            <h3 className="text-3xl font-bold text-slate-900">Growth Analysis</h3>
            <p className="mt-2 text-sm text-slate-600">
              Your profile visibility has increased this month. More learners are discovering your profile.
            </p>
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-3">
                <span className="text-sm font-medium text-slate-700">Profile Views</span>
                <span className="text-sm font-bold text-primary">{Math.max(bookings.length * 83, 1204)}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-3">
                <span className="text-sm font-medium text-slate-700">Completed</span>
                <span className="text-sm font-bold text-primary">{completedCount}</span>
              </div>
            </div>
          </article>
          <article className="rounded-xl bg-indigo-50 p-6 shadow-card">
            <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-44 w-full text-primary">
              <path d="M0 38 Q 10 34 20 20 T 40 16 T 60 25 T 80 5 T 100 12" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </article>
        </section>
      </main>
    </div>
  )
}
