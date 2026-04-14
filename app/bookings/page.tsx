'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Toast from '@/components/Toast'
import { cancelBooking, listBookings, submitReview, type Booking } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

type BookingTab = 'all' | 'upcoming' | 'completed'

const STATUS_LABEL: Record<string, string> = {
  accepted: 'Awaiting Payment',
  pending_payment: 'Payment Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  requested: 'Requested',
}

const STATUS_BADGE: Record<string, string> = {
  accepted: 'bg-blue-100 text-blue-700',
  pending_payment: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  requested: 'bg-slate-100 text-slate-700',
}

function formatDate(slotDate: string) {
  return new Date(slotDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function BookingsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<BookingTab>('upcoming')
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null)
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null)
  const [rating, setRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const loadBookings = useCallback(async () => {
    setError('')
    try {
      const data = await listBookings('learner')
      setBookings(Array.isArray(data) ? data : [])
    } catch {
      setError('Could not load your bookings right now. Please try again.')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login')
      return
    }
    if (user) loadBookings()
  }, [authLoading, loadBookings, router, user])

  const filtered = useMemo(() => {
    if (tab === 'upcoming') return bookings.filter((booking) => ['requested', 'accepted', 'pending_payment', 'confirmed'].includes(booking.status))
    if (tab === 'completed') return bookings.filter((booking) => ['completed', 'cancelled'].includes(booking.status))
    return bookings
  }, [bookings, tab])

  async function confirmCancel() {
    if (!cancelBookingId) return
    setSubmitting(true)

    try {
      await cancelBooking(cancelBookingId, 'Cancelled by learner')
      setToast({ message: 'Booking cancelled successfully.', type: 'info' })
      setCancelBookingId(null)
      await loadBookings()
    } catch {
      setToast({ message: 'We could not cancel this booking. Please try again.', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  async function submitBookingReview() {
    if (!reviewBookingId) return
    setSubmitting(true)

    try {
      await submitReview({
        bookingId: reviewBookingId,
        rating,
        comment: reviewComment.trim() || undefined,
      })
      setToast({ message: 'Review submitted. Thank you!', type: 'success' })
      setReviewBookingId(null)
      setRating(5)
      setReviewComment('')
      await loadBookings()
    } catch {
      setToast({ message: 'Could not submit review. Please try again.', type: 'error' })
    } finally {
      setSubmitting(false)
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

      <main className="app-shell px-4 py-10 sm:px-6">
        <section className="mb-8">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900">My Bookings</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Manage your upcoming sessions and review your past learning journey with our world-class experts.
          </p>
        </section>

        <div className="mb-7 flex gap-8 border-b border-slate-200">
          {(['upcoming', 'completed', 'all'] as BookingTab[]).map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`pb-3 text-sm font-semibold capitalize ${
                tab === item ? 'border-b-2 border-primary text-primary' : 'text-slate-500'
              }`}
            >
              {item === 'all' ? 'All' : item}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={loadBookings} className="mt-2 text-sm font-semibold text-red-700 underline">
              Retry
            </button>
          </div>
        )}

        {!error && filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card">
            <h2 className="text-lg font-semibold text-slate-900">No bookings to show</h2>
            <p className="mt-1 text-sm text-slate-500">Your sessions will appear here once you book an expert.</p>
          </div>
        )}

        {!error && filtered.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {filtered.map((booking) => {
              const needsPayment = booking.status === 'accepted' || booking.status === 'pending_payment'
              const canCancel = ['requested', 'accepted', 'pending_payment', 'confirmed'].includes(booking.status)
              const canReview = booking.status === 'completed'
              const statusLabel = STATUS_LABEL[booking.status] ?? booking.status

              return (
                <article key={booking.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">{booking.expert?.user.name ?? 'Expert'}</h3>
                      <p className="mt-1 text-sm font-medium text-primary">
                        {booking.pricing?.type === 'package' ? 'Package Session' : 'Single Session'}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[booking.status] ?? 'bg-slate-100 text-slate-700'}`}>
                      {statusLabel}
                    </span>
                  </div>

                  <p className="mt-4 text-sm text-slate-600">
                    {formatDate(booking.slotDate)} • {booking.slotStart} - {booking.slotEnd}
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    {booking.pricing
                      ? `${booking.pricing.type === 'package' ? 'Package' : 'Per Session'} • Rs ${(booking.pricing.amount / 100).toLocaleString('en-IN')} • ${booking.pricing.durationMins} min`
                      : 'Pricing details unavailable'}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {needsPayment && (() => {
                      const params = new URLSearchParams({
                        bookingId: booking.id,
                        expertName: booking.expert?.user.name ?? 'Expert',
                        amount: String(booking.pricing?.amount ?? 0),
                        duration: String(booking.pricing?.durationMins ?? 60),
                        date: booking.slotDate,
                        start: booking.slotStart,
                        end: booking.slotEnd,
                        mode: booking.mode,
                      })
                      return (
                        <Link
                          href={`/booking/confirm?${params.toString()}`}
                          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
                        >
                          Complete Payment
                        </Link>
                      )
                    })()}
                    {canReview && (
                      <button
                        onClick={() => {
                          setReviewBookingId(booking.id)
                          setRating(5)
                          setReviewComment('')
                        }}
                        className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700"
                      >
                        Leave Review
                      </button>
                    )}
                    {canCancel && (
                      <button
                        onClick={() => setCancelBookingId(booking.id)}
                        className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>

      {cancelBookingId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-900">Cancel Booking?</h2>
            <p className="mt-2 text-sm text-slate-500">
              This will cancel your upcoming session. You can book another slot anytime.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setCancelBookingId(null)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Keep Booking
              </button>
              <button
                onClick={confirmCancel}
                disabled={submitting}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {submitting ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {reviewBookingId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-900">Leave Review</h2>
            <p className="mt-1 text-sm text-slate-500">How was your session experience?</p>

            <div className="mt-4 flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => setRating(value)}
                  className={`text-3xl ${value <= rating ? 'text-amber-400' : 'text-slate-200'}`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              value={reviewComment}
              onChange={(event) => setReviewComment(event.target.value)}
              placeholder="Share your feedback (optional)"
              rows={4}
              className="mt-4 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-primary"
            />

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setReviewBookingId(null)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={submitBookingReview}
                disabled={submitting}
                className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
