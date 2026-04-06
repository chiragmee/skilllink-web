'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import TopBar from '@/components/TopBar'
import Toast from '@/components/Toast'
import { listBookings, cancelBooking, completeBooking, submitReview, type Booking } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

const STATUS_LABEL: Record<string, string> = {
  requested: 'Requested',
  accepted: 'Awaiting Payment',
  pending_payment: 'Payment Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
}

const STATUS_COLORS: Record<string, string> = {
  accepted: 'bg-blue-100 text-blue-700',
  pending_payment: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-green-100 text-green-700',
  completed: 'bg-zinc-100 text-zinc-600',
  cancelled: 'bg-red-100 text-red-600',
  no_show: 'bg-orange-100 text-orange-700',
}

export default function BookingsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [tab, setTab] = useState<'all' | 'upcoming' | 'completed'>('all')
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const fetchBookings = useCallback(async () => {
    setFetchError('')
    try {
      const data = await listBookings('learner')
      setBookings(Array.isArray(data) ? data : [])
    } catch {
      setFetchError('Could not load your bookings. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return }
    if (user) fetchBookings()
  }, [user, authLoading, router, fetchBookings])

  const filtered = bookings.filter(b => {
    if (tab === 'upcoming') return ['accepted', 'pending_payment', 'confirmed'].includes(b.status)
    if (tab === 'completed') return ['completed', 'cancelled'].includes(b.status)
    return true
  })

  async function handleCancel(id: string) {
    if (!window.confirm('Cancel this booking? This cannot be undone.')) return
    setSubmitting(true)
    try {
      await cancelBooking(id, 'Cancelled by learner')
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
      setToast({ message: 'Booking cancelled successfully.', type: 'info' })
    } catch (err: any) {
      setToast({ message: err.message || 'Could not cancel booking. Please try again.', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReview() {
    if (!reviewBookingId) return
    if (reviewRating < 1 || reviewRating > 5) {
      setToast({ message: 'Please select a rating between 1 and 5.', type: 'error' })
      return
    }
    setSubmitting(true)
    try {
      await submitReview({ bookingId: reviewBookingId, rating: reviewRating, comment: reviewComment.trim() })
      await fetchBookings()
      setReviewBookingId(null)
      setToast({ message: 'Review submitted! Thank you.', type: 'success' })
    } catch (err: any) {
      setToast({ message: err.message || 'Could not submit review. Please try again.', type: 'error' })
    } finally {
      setSubmitting(false)
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
      <TopBar variant="back" />
      <main className="mt-16 max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold mt-6 mb-4">My Bookings</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'upcoming', 'completed'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={'px-4 py-2 rounded-xl font-semibold text-sm capitalize transition-colors ' +
                (tab === t ? 'bg-primary text-white' : 'bg-white border border-zinc-200 text-on-surface-variant')}>
              {t}
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
        {filtered.length === 0 && !fetchError ? (
          <div className="text-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-4 block">calendar_today</span>
            <p className="font-semibold text-lg">
              {tab === 'upcoming' ? 'No upcoming sessions' :
               tab === 'completed' ? 'No completed sessions yet' : 'No bookings yet'}
            </p>
            <p className="text-sm mt-2 text-zinc-400">
              {tab !== 'completed' ? 'Find an expert and book your first session' : 'Completed sessions will appear here'}
            </p>
            {tab !== 'completed' && (
              <Link href="/" className="inline-block mt-4 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold">
                Find an Expert
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(b => {
              const expertName = b.expert?.user.name || 'Expert'
              const slotDate = new Date(b.slotDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
              const needsPayment = b.status === 'accepted' || b.status === 'pending_payment'
              return (
                <div key={b.id} className="bg-white rounded-2xl p-5 border border-zinc-100">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-lg">{expertName}</p>
                      <p className="text-zinc-500 text-sm">{slotDate} · {b.slotStart} – {b.slotEnd}</p>
                    </div>
                    <span className={'text-xs font-semibold px-3 py-1 rounded-full ' + (STATUS_COLORS[b.status] || 'bg-zinc-100 text-zinc-600')}>
                      {STATUS_LABEL[b.status] || b.status}
                    </span>
                  </div>
                  {b.pricing && (
                    <p className="text-sm text-zinc-500 mb-3">
                      {b.pricing.type === 'hourly' ? 'Per Session' : 'Package'} · ₹{(b.pricing.amount / 100).toLocaleString('en-IN')} · {b.pricing.durationMins} min
                    </p>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    {needsPayment && (
                      <Link href={'/booking/confirm?' + new URLSearchParams({
                        bookingId: b.id,
                        expertId: b.expertId,
                        pricingId: b.pricingId,
                        date: new Date(b.slotDate).toISOString().split('T')[0],
                        start: b.slotStart, end: b.slotEnd, mode: b.mode,
                        expertName: b.expert?.user?.name || 'Expert',
                        amount: String(b.pricing?.amount || 0),
                        duration: String(b.pricing?.durationMins || 60),
                      }).toString()}
                        className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">payments</span>
                        Complete Payment
                      </Link>
                    )}
                    {b.status === 'completed' && !b.payment && (
                      <button onClick={() => { setReviewBookingId(b.id); setReviewRating(5); setReviewComment('') }}
                        className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-sm font-semibold border border-amber-200">
                        Leave Review
                      </button>
                    )}
                    {['accepted', 'pending_payment', 'confirmed'].includes(b.status) && (
                      <button onClick={() => handleCancel(b.id)} disabled={submitting}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-200 disabled:opacity-50">
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

      {/* Review modal */}
      {reviewBookingId && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6">
            <h2 className="font-bold text-xl mb-1">Leave a Review</h2>
            <p className="text-zinc-400 text-sm mb-4">How was your session?</p>
            <div className="flex gap-3 mb-4">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setReviewRating(n)}
                  className={'text-3xl transition-transform ' + (n <= reviewRating ? 'text-amber-400 scale-110' : 'text-zinc-200')}>
                  ★
                </button>
              ))}
            </div>
            <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)}
              placeholder="Share your experience (optional)…" rows={3} maxLength={500}
              className="w-full border border-zinc-200 rounded-xl p-3 text-sm mb-4 outline-none focus:border-primary resize-none" />
            <div className="flex gap-3">
              <button onClick={() => setReviewBookingId(null)} disabled={submitting}
                className="flex-1 py-3 border border-zinc-200 rounded-xl font-semibold text-sm">
                Cancel
              </button>
              <button onClick={handleReview} disabled={submitting}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold text-sm disabled:opacity-60">
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav mode="learner" />
    </div>
  )
}
