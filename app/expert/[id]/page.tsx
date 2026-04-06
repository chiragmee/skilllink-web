'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import TopBar from '@/components/TopBar'
import { getExpert, getAvailableSlots, getExpertReviews, type Expert, type AvailabilitySlot } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

function formatDate(d: Date) { return d.toISOString().split('T')[0] }
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r }
const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function ExpertPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const [expert, setExpert] = useState<Expert | null>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const today = new Date()
  const [selectedDate, setSelectedDate] = useState(formatDate(today))
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null)
  const [selectedPricingId, setSelectedPricingId] = useState('')
  const [slotsLoading, setSlotsLoading] = useState(false)

  useEffect(() => {
    Promise.all([getExpert(id), getExpertReviews(id)])
      .then(([exp, revs]) => {
        setExpert(exp)
        setReviews(Array.isArray(revs) ? revs : [])
        if (exp?.pricing?.length > 0) setSelectedPricingId(exp.pricing[0].id)
      })
      .catch(() => setExpert(null))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    setSlotsLoading(true)
    getAvailableSlots(id, selectedDate)
      .then(data => setSlots(Array.isArray(data) ? data : []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false))
    setSelectedSlot(null)
  }, [id, selectedDate])

  function handleBook() {
    if (!user) { router.push('/login'); return }
    if (!selectedSlot || !selectedPricingId) return
    const pricing = expert?.pricing.find(p => p.id === selectedPricingId)
    const params = new URLSearchParams({
      expertId: id, pricingId: selectedPricingId, date: selectedDate,
      start: selectedSlot.startTime, end: selectedSlot.endTime,
      mode: expert?.mode === 'offline' ? 'offline' : 'online',
      expertName: expert?.user.name || '', amount: String(pricing?.amount || 0),
      duration: String(pricing?.durationMins || 60),
    })
    router.push('/booking/confirm?' + params.toString())
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  )
  if (!expert) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-6 text-center">
      <span className="material-symbols-outlined text-5xl text-zinc-300 mb-4">person_off</span>
      <p className="text-xl font-bold mb-2">Expert not found</p>
      <p className="text-zinc-400 text-sm mb-6">This profile may have been removed or the link is incorrect.</p>
      <Link href="/" className="px-6 py-3 bg-primary text-white rounded-2xl font-bold">Browse Experts</Link>
    </div>
  )

  const dates = Array.from({ length: 7 }, (_, i) => addDays(today, i))

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32">
      <TopBar variant="back" />
      <main className="mt-16 max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-3xl p-6 shadow-editorial mt-4">
          <div className="flex gap-5 items-start">
            <div className="w-20 h-20 flex-shrink-0">
              {expert.user.avatarUrl ? (
                <img src={expert.user.avatarUrl} alt={expert.user.name||''} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <div className="w-full h-full bg-indigo-100 rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-indigo-400 text-3xl">person</span>
                </div>
              )}
            </div>
            <div className="flex-grow">
              <h1 className="text-xl font-bold">{expert.user.name}</h1>
              <p className="text-primary font-semibold text-sm">{expert.expertSkills.map(es => es.skill.name).join(' · ')}</p>
              {expert.city && <p className="text-zinc-400 text-xs mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-xs">location_on</span>{expert.city}</p>}
              <div className="flex gap-4 mt-2">
                {expert.totalReviews > 0 && (
                  <span className="text-sm font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-amber-400 text-sm" style={{fontVariationSettings:"'FILL' 1"}}>star</span>
                    {Number(expert.avgRating).toFixed(1)} ({expert.totalReviews})
                  </span>
                )}
                <span className="text-sm text-zinc-500 capitalize">{expert.mode} sessions</span>
              </div>
            </div>
          </div>
          {expert.bio && <p className="mt-4 text-on-surface-variant text-sm leading-relaxed">{expert.bio}</p>}
        </div>

        {expert.pricing.length > 0 && (
          <div className="mt-6">
            <h2 className="font-bold text-lg mb-3">Choose a Plan</h2>
            <div className="grid grid-cols-1 gap-3">
              {expert.pricing.map(p => (
                <button key={p.id} onClick={() => setSelectedPricingId(p.id)}
                  className={'w-full text-left p-4 rounded-2xl border-2 transition-all ' + (selectedPricingId===p.id?'border-primary bg-indigo-50':'border-zinc-100 bg-white')}>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{p.skill.name} — {p.type==='hourly'?'Per Session':p.sessions+' Sessions'}</p>
                      <p className="text-zinc-500 text-sm">{p.durationMins} min</p>
                    </div>
                    <p className="text-xl font-extrabold text-primary">&#8377;{(p.amount/100).toLocaleString('en-IN')}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <h2 className="font-bold text-lg mb-3">Select Date</h2>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            {dates.map(d => {
              const ds = formatDate(d); const isSel = ds===selectedDate
              return (
                <button key={ds} onClick={() => setSelectedDate(ds)}
                  className={'flex-shrink-0 flex flex-col items-center w-14 py-3 rounded-2xl transition-all ' + (isSel?'bg-primary text-white':'bg-white border border-zinc-100')}>
                  <span className="text-xs font-semibold">{DAY_LABELS[d.getDay()]}</span>
                  <span className="text-lg font-bold">{d.getDate()}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="font-bold text-lg mb-3">Available Slots</h2>
          {slotsLoading ? (
            <div className="flex gap-3">{[1,2,3].map(i=><div key={i} className="h-12 w-24 bg-zinc-100 rounded-xl animate-pulse"/>)}</div>
          ) : slots.length===0 ? (
            <div className="bg-zinc-50 rounded-2xl p-5 text-center border border-zinc-100">
              <span className="material-symbols-outlined text-3xl text-zinc-300 mb-2 block">event_busy</span>
              <p className="text-zinc-500 text-sm font-medium">No slots available on this day</p>
              <p className="text-zinc-400 text-xs mt-1">Try selecting a different date above</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {slots.map(slot => (
                <button key={slot.id} onClick={() => setSelectedSlot(slot)}
                  className={'px-4 py-2.5 rounded-xl font-semibold text-sm border-2 transition-all ' + (selectedSlot?.id===slot.id?'bg-primary text-white border-primary':'bg-white text-on-surface border-zinc-200 hover:border-primary')}>
                  {slot.startTime} - {slot.endTime}
                </button>
              ))}
            </div>
          )}
        </div>

        {reviews.length > 0 && (
          <div className="mt-8 mb-8">
            <h2 className="font-bold text-lg mb-3">Reviews ({reviews.length})</h2>
            <div className="space-y-3">
              {reviews.slice(0,5).map(r => (
                <div key={r.id} className="bg-white rounded-2xl p-4 border border-zinc-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm text-indigo-400">person</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{r.reviewer.name||'Anonymous'}</p>
                      <div className="flex">{Array.from({length:5}).map((_,i)=><span key={i} className={'text-xs '+(i<r.rating?'text-amber-400':'text-zinc-200')}>*</span>)}</div>
                    </div>
                  </div>
                  {r.comment && <p className="text-sm text-on-surface-variant">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-100 p-4">
        <div className="max-w-2xl mx-auto">
          <button onClick={handleBook} disabled={!selectedSlot||!selectedPricingId}
            className="w-full bg-primary text-white font-bold py-4 rounded-2xl text-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors">
            {!user?'Sign in to Book':!selectedSlot?'Select a Slot':'Book Now'}
          </button>
        </div>
      </div>
    </div>
  )
}
