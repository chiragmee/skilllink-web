'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

const WEEKDAY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

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

  const dateOptions = useMemo(() => Array.from({ length: 14 }, (_, index) => addDays(new Date(), index)), [])

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
          setSlotsError('Unable to load slots for this date.')
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
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-7">
            <Link href="/" className="text-xl font-bold text-primary">SkillLink</Link>
            <nav className="hidden items-center gap-5 text-xs font-medium text-slate-500 md:flex">
              <Link href="/" className="hover:text-primary">Experts</Link>
              <span>Badminton</span>
              <span>Music</span>
              <span>Fitness</span>
            </nav>
          </div>
          <button className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white">Book Now</button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-6 sm:px-6">
        <section className="relative mb-10">
          <div className="h-56 w-full rounded-2xl bg-indigo-100/60" />
          <div className="-mt-12 flex flex-col gap-5 px-4 lg:flex-row lg:items-end">
            <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-lg">
              {expert.user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={expert.user.avatarUrl} alt={expert.user.name ?? 'Expert'} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-indigo-100 text-indigo-500">
                  <span className="material-symbols-outlined text-3xl">person</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-extrabold tracking-tight">{expert.user.name ?? 'Expert'}</h1>
              <p className="mt-1 text-lg text-slate-600">{getTopSkill(expert)}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded-full bg-amber-200 px-2 py-1 text-amber-900">★ {Number(expert.avgRating || 0).toFixed(1)}</span>
                <span className="text-slate-500">({expert.totalReviews} Reviews)</span>
                <span className="text-primary">{expert.city || 'Location not specified'}</span>
              </div>
            </div>
            <button className="rounded-xl bg-primary px-7 py-3 text-sm font-semibold text-white">Book a Session</button>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-8">
            <div className="flex gap-8 border-b border-slate-200">
              <button className="border-b-2 border-primary pb-3 text-sm font-semibold text-primary">About</button>
              <button className="pb-3 text-sm font-medium text-slate-500">Skills</button>
              <button className="pb-3 text-sm font-medium text-slate-500">Reviews</button>
            </div>

            {expert.bio && (
              <section>
                <h2 className="text-2xl font-bold">Experience Harmony</h2>
                <p className="mt-4 leading-7 text-slate-600">{expert.bio}</p>
              </section>
            )}

            <section>
              <h2 className="text-2xl font-bold">Skills & Expertise</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                {expert.expertSkills.map((skill) => (
                  <div key={skill.id} className="rounded-xl bg-slate-100 p-4">
                    <p className="text-sm font-semibold">{skill.skill.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{skill.proficiency}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold">Session Packs</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                {expert.pricing.map((pricing) => (
                  <button
                    key={pricing.id}
                    onClick={() => setSelectedPricingId(pricing.id)}
                    className={`rounded-xl border p-5 text-left shadow-sm ${
                      selectedPricingId === pricing.id ? 'border-primary bg-indigo-50' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <p className="text-lg font-bold">{pricing.type === 'package' ? 'Package' : 'Session Pack'}</p>
                    <p className="mt-1 text-sm text-slate-500">{pricing.durationMins} minutes</p>
                    <p className="mt-4 text-4xl font-extrabold">Rs {(pricing.amount / 100).toLocaleString('en-IN')}</p>
                    <span className="mt-5 inline-block rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white">
                      Select Pack
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {reviews.length > 0 && (
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Recent Testimonials</h2>
                  <button className="text-sm font-semibold text-primary">View All</button>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {reviews.slice(0, 2).map((review) => (
                    <article key={review.id} className="rounded-xl bg-slate-100 p-4">
                      <p className="text-sm font-semibold">{review.reviewer.name || 'Learner'}</p>
                      <p className="mt-2 text-sm italic text-slate-600">{review.comment || 'Great session and clear guidance.'}</p>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-[0_20px_40px_rgba(25,28,29,0.06)]">
              <h3 className="text-xl font-bold">Check Availability</h3>
              <div className="mt-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold">Upcoming Days</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {dateOptions.slice(0, 14).map((date) => {
                    const key = toDateKey(date)
                    const active = selectedDate === key
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedDate(key)}
                        className={`rounded-md py-1 text-[11px] ${active ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                      >
                        {WEEKDAY[date.getDay() === 0 ? 6 : date.getDay() - 1].slice(0, 1)}
                        <br />
                        {date.getDate()}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Available Slots</p>
                {slotsLoading && <p className="text-sm text-slate-500">Loading slots...</p>}
                {!slotsLoading && slotsError && <p className="text-sm text-red-600">{slotsError}</p>}
                {!slotsLoading && !slotsError && slots.length === 0 && <p className="text-sm text-slate-500">No slots available.</p>}
                <div className="space-y-2">
                  {!slotsLoading &&
                    !slotsError &&
                    slots.map((slot, index) => {
                      const key = `${slot.startTime}-${slot.endTime}-${index}`
                      const active = selectedSlot?.startTime === slot.startTime && selectedSlot?.endTime === slot.endTime
                      return (
                        <button
                          key={key}
                          onClick={() => setSelectedSlot({ startTime: slot.startTime, endTime: slot.endTime })}
                          className={`w-full rounded-lg border px-3 py-2 text-sm font-semibold ${
                            active ? 'border-primary bg-primary text-white' : 'border-slate-200 text-slate-700'
                          }`}
                        >
                          {slot.startTime} - {slot.endTime}
                        </button>
                      )
                    })}
                </div>
              </div>

              <button
                onClick={handleBookSession}
                disabled={!selectedPricingId || !selectedSlot}
                className="mt-5 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {!user ? 'Sign in to book' : 'Confirm Booking'}
              </button>
              <p className="mt-3 text-center text-xs text-slate-500">Free cancellation up to 24h before session</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

function getTopSkill(expert: Expert) {
  return expert.expertSkills[0]?.skill.name ?? 'Skill Coach'
}
