'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import TopBar from '@/components/TopBar'
import {
  getAvailableSlots,
  getExpert,
  getExpertReviews,
  type AvailabilitySlot,
  type Expert,
  type Review,
} from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

function toDateKey(date: Date) {
  return date.toISOString().split('T')[0]
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function ExpertProfilePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const expertId = params.id
  const [expert, setExpert] = useState<Expert | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState('')
  const [selectedPricingId, setSelectedPricingId] = useState('')
  const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()))
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: string; endTime: string } | null>(null)
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsError, setSlotsError] = useState('')

  const dateOptions = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(new Date(), index)), [])

  useEffect(() => {
    let mounted = true

    async function loadProfile() {
      setProfileLoading(true)
      setProfileError('')

      try {
        const [expertData, reviewsData] = await Promise.all([getExpert(expertId), getExpertReviews(expertId)])
        if (!mounted) return

        setExpert(expertData)
        setReviews(Array.isArray(reviewsData) ? reviewsData : [])
        setSelectedPricingId(expertData.pricing[0]?.id ?? '')
      } catch {
        if (mounted) setProfileError('We could not load this expert profile right now.')
      } finally {
        if (mounted) setProfileLoading(false)
      }
    }

    loadProfile()

    return () => {
      mounted = false
    }
  }, [expertId])

  useEffect(() => {
    let mounted = true

    async function loadSlots() {
      setSlotsLoading(true)
      setSlotsError('')
      setSelectedSlot(null)

      try {
        const slotData = await getAvailableSlots(expertId, selectedDate)
        if (!mounted) return
        setSlots(Array.isArray(slotData) ? slotData : [])
      } catch {
        if (mounted) {
          setSlots([])
          setSlotsError('Unable to load slots for this date. Please try another date.')
        }
      } finally {
        if (mounted) setSlotsLoading(false)
      }
    }

    loadSlots()

    return () => {
      mounted = false
    }
  }, [expertId, selectedDate])

  function handleBookSession() {
    if (!user) {
      router.push('/login')
      return
    }

    if (!expert || !selectedPricingId || !selectedSlot) return

    const selectedPricing = expert.pricing.find((pricing) => pricing.id === selectedPricingId)
    if (!selectedPricing) return

    const query = new URLSearchParams({
      expertId,
      pricingId: selectedPricing.id,
      date: selectedDate,
      start: selectedSlot.startTime,
      end: selectedSlot.endTime,
      mode: expert.mode,
      expertName: expert.user.name ?? 'Expert',
      amount: String(selectedPricing.amount),
      duration: String(selectedPricing.durationMins),
    })

    router.push(`/booking/confirm?${query.toString()}`)
  }

  if (profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    )
  }

  if (profileError || !expert) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-sm rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-card">
          <h1 className="text-lg font-semibold text-slate-900">Expert profile unavailable</h1>
          <p className="mt-2 text-sm text-slate-500">{profileError || 'Please try again in a few moments.'}</p>
          <Link href="/" className="mt-5 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">
            Back to homepage
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <TopBar variant="back" backHref="/" title="Expert Profile" />

      <main className="app-shell px-4 pb-24 pt-5 sm:px-6">
        <section className="rounded-3xl bg-white p-5 shadow-card">
          <div className="flex gap-4">
            {expert.user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={expert.user.avatarUrl}
                alt={expert.user.name ?? 'Expert'}
                className="h-20 w-20 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                <span className="material-symbols-outlined text-3xl">person</span>
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-semibold text-slate-900">{expert.user.name ?? 'Expert'}</h1>
              <p className="mt-1 text-sm text-slate-600">{expert.city || 'Location not specified'}</p>

              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold capitalize text-indigo-700">
                  {expert.mode} sessions
                </span>
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  {expert.totalReviews > 0
                    ? `${Number(expert.avgRating).toFixed(1)} stars (${expert.totalReviews} reviews)`
                    : 'No reviews yet'}
                </span>
              </div>
            </div>
          </div>

          {expert.bio && <p className="mt-4 text-sm leading-6 text-slate-600">{expert.bio}</p>}

          {expert.expertSkills.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Skills</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {expert.expertSkills.map((skill) => (
                  <span key={skill.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {skill.skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold text-slate-900">Choose Pricing</h2>
          <div className="mt-3 grid gap-3">
            {expert.pricing.map((pricing) => (
              <button
                key={pricing.id}
                onClick={() => setSelectedPricingId(pricing.id)}
                className={`rounded-2xl border p-4 text-left shadow-card transition ${
                  selectedPricingId === pricing.id ? 'border-primary bg-indigo-50' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{pricing.skill.name}</p>
                    <p className="text-xs text-slate-500">
                      {pricing.type === 'package'
                        ? `${pricing.sessions ?? 1} sessions · ${pricing.durationMins} min each`
                        : `${pricing.durationMins} min session`}
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">Rs {(pricing.amount / 100).toLocaleString('en-IN')}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold text-slate-900">Select Date</h2>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {dateOptions.map((date) => {
              const dateKey = toDateKey(date)
              const selected = selectedDate === dateKey

              return (
                <button
                  key={dateKey}
                  onClick={() => setSelectedDate(dateKey)}
                  className={`min-w-[66px] rounded-2xl px-3 py-3 text-center ${
                    selected ? 'bg-primary text-white' : 'bg-white text-slate-700 shadow-card'
                  }`}
                >
                  <p className="text-xs font-semibold">{WEEKDAY[date.getDay()]}</p>
                  <p className="mt-0.5 text-lg font-semibold">{date.getDate()}</p>
                </button>
              )
            })}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-semibold text-slate-900">Available Time Slots</h2>

          {slotsLoading && (
            <div className="mt-3 flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((slot) => (
                <div key={slot} className="h-11 w-28 animate-pulse rounded-xl bg-slate-200" />
              ))}
            </div>
          )}

          {!slotsLoading && slotsError && (
            <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-700">{slotsError}</p>
            </div>
          )}

          {!slotsLoading && !slotsError && slots.length === 0 && (
            <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">No slots available on this date. Choose another date to continue.</p>
            </div>
          )}

          {!slotsLoading && !slotsError && slots.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {slots.map((slot, index) => {
                const key = `${slot.startTime}-${slot.endTime}-${index}`
                const active = selectedSlot?.startTime === slot.startTime && selectedSlot?.endTime === slot.endTime

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedSlot({ startTime: slot.startTime, endTime: slot.endTime })}
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                      active ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    {slot.startTime} - {slot.endTime}
                  </button>
                )
              })}
            </div>
          )}
        </section>

        {reviews.length > 0 && (
          <section className="mt-6">
            <h2 className="text-lg font-semibold text-slate-900">Recent Reviews</h2>
            <div className="mt-3 space-y-3">
              {reviews.slice(0, 4).map((review) => (
                <div key={review.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">{review.reviewer.name || 'Learner'}</p>
                    <p className="text-xs font-semibold text-amber-600">{review.rating}/5</p>
                  </div>
                  {review.comment && <p className="mt-2 text-sm text-slate-600">{review.comment}</p>}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white p-4">
        <div className="app-shell">
          <button
            onClick={handleBookSession}
            disabled={!selectedPricingId || !selectedSlot}
            className="w-full rounded-2xl bg-primary px-4 py-4 text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {!user ? 'Sign in to book' : 'Book This Session'}
          </button>
        </div>
      </div>
    </div>
  )
}
