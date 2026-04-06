'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TopBar from '@/components/TopBar'
import { getCategories, createExpertProfile, addExpertSkill, addExpertPricing, setAvailability, type SkillCategory } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface SelectedSkill { skillId: string; skillName: string; experienceYrs: number; proficiency: string }
interface PricingEntry { skillId: string; skillName: string; type: string; amount: string; durationMins: string; sessions: string }
interface SlotEntry { dayOfWeek: number; startTime: string; endTime: string }

export default function RegisterExpertPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [categories, setCategories] = useState<SkillCategory[]>([])
  const [categoriesError, setCategoriesError] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Step 1
  const [bio, setBio] = useState('')
  const [city, setCity] = useState('')
  const [mode, setMode] = useState('online')

  // Step 2
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>([])
  const [openCategory, setOpenCategory] = useState<string | null>(null)

  // Step 3
  const [pricing, setPricing] = useState<PricingEntry[]>([])

  // Step 4
  const [slots, setSlots] = useState<SlotEntry[]>([])
  const [newSlot, setNewSlot] = useState({ dayOfWeek: 0, startTime: '09:00', endTime: '10:00' })
  const [slotError, setSlotError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return }
    if (!authLoading && user?.expertProfileId) { router.replace('/dashboard'); return }
    getCategories()
      .then(data => { setCategories(Array.isArray(data) ? data : []); setCategoriesError(false) })
      .catch(() => setCategoriesError(true))
  }, [user, authLoading, router])

  function toggleSkill(skillId: string, skillName: string) {
    setSelectedSkills(prev => {
      const exists = prev.find(s => s.skillId === skillId)
      if (exists) return prev.filter(s => s.skillId !== skillId)
      return [...prev, { skillId, skillName, experienceYrs: 1, proficiency: 'intermediate' }]
    })
  }

  function updateSkill(skillId: string, field: string, value: string | number) {
    setSelectedSkills(prev => prev.map(s => s.skillId === skillId ? { ...s, [field]: value } : s))
  }

  useEffect(() => {
    setPricing(prev => selectedSkills.map(sk => {
      const existing = prev.find(p => p.skillId === sk.skillId)
      return existing || { skillId: sk.skillId, skillName: sk.skillName, type: 'hourly', amount: '', durationMins: '60', sessions: '5' }
    }))
  }, [selectedSkills])

  function updatePricing(skillId: string, field: string, value: string) {
    setPricing(prev => prev.map(p => p.skillId === skillId ? { ...p, [field]: value } : p))
  }

  function addSlot() {
    setSlotError('')
    if (newSlot.startTime >= newSlot.endTime) {
      setSlotError('End time must be after start time.')
      return
    }
    const duplicate = slots.some(s => s.dayOfWeek === newSlot.dayOfWeek && s.startTime === newSlot.startTime)
    if (duplicate) {
      setSlotError('A slot with this day and start time already exists.')
      return
    }
    setSlots(prev => [...prev, { ...newSlot }])
  }

  function removeSlot(idx: number) {
    setSlots(prev => prev.filter((_, i) => i !== idx))
  }

  const pricingValid = pricing.length === 0 || pricing.every(p => {
    const amt = parseFloat(p.amount)
    return !p.amount || (amt > 0)
  })

  async function handleSubmit() {
    setSubmitting(true)
    setError('')
    try {
      const profile = await createExpertProfile({ bio, city, mode: mode as any })
      if (!profile?.id) throw new Error('Could not create your expert profile. Please try again.')
      const expertId = profile.id

      for (const sk of selectedSkills) {
        await addExpertSkill(expertId, {
          skillId: sk.skillId,
          experienceYrs: sk.experienceYrs,
          proficiency: sk.proficiency as any,
        })
      }

      for (const p of pricing) {
        const amt = parseFloat(p.amount)
        if (!p.amount || isNaN(amt) || amt <= 0) continue
        await addExpertPricing(expertId, {
          skillId: p.skillId,
          type: p.type as any,
          amount: Math.round(amt * 100),
          durationMins: parseInt(p.durationMins),
          sessions: p.type === 'package' ? parseInt(p.sessions) : undefined,
        })
      }

      if (slots.length > 0) {
        await setAvailability(expertId, slots)
      }

      if (user) {
        const updatedUser = {
          ...user,
          role: user.role === 'learner' ? 'both' : user.role,
          expertProfileId: expertId,
        }
        localStorage.setItem('skilllink_user', JSON.stringify(updatedUser))
      }

      window.location.assign('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  )

  const stepTitles = ['Your Profile', 'Your Skills', 'Set Pricing', 'Availability']

  return (
    <div className="bg-surface min-h-screen pb-32">
      <TopBar variant="back" />
      <main className="mt-16 max-w-lg mx-auto px-4">

        {/* Progress */}
        <div className="mt-6 mb-6">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold">Become an Expert</h1>
            <span className="text-sm text-zinc-400">{step}/4</span>
          </div>
          <p className="text-on-surface-variant text-sm mb-3">{stepTitles[step - 1]}</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={'h-1.5 flex-1 rounded-full transition-colors ' + (s <= step ? 'bg-primary' : 'bg-zinc-200')} />
            ))}
          </div>
        </div>

        {/* Global error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex gap-2 items-start">
            <span className="material-symbols-outlined text-red-500 text-base flex-shrink-0 mt-0.5">error</span>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* STEP 1 — Profile */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-on-surface-variant block mb-1">Bio <span className="text-red-500">*</span></label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} maxLength={800}
                placeholder="Tell learners about yourself, your experience and teaching style…"
                className="w-full border border-zinc-200 rounded-xl p-3 text-sm outline-none focus:border-primary resize-none" />
              <p className="text-xs text-zinc-400 mt-1 text-right">{bio.length}/800</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-on-surface-variant block mb-1">City <span className="text-red-500">*</span></label>
              <input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g., Mumbai, Bangalore, Pune"
                className="w-full border border-zinc-200 rounded-xl p-3 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-sm font-semibold text-on-surface-variant block mb-2">Session Mode <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-3 gap-2">
                {['online', 'offline', 'both'].map(m => (
                  <button key={m} onClick={() => setMode(m)}
                    className={'py-3 rounded-xl border-2 font-semibold text-sm capitalize transition-all ' +
                      (mode === m ? 'border-primary bg-indigo-50 text-primary' : 'border-zinc-200 text-on-surface-variant')}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — Skills */}
        {step === 2 && (
          <div>
            <p className="text-sm text-on-surface-variant mb-4">Select the skills you teach. You can add more later.</p>

            {selectedSkills.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {selectedSkills.map(s => (
                  <span key={s.skillId} className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    {s.skillName}
                    <button onClick={() => toggleSkill(s.skillId, s.skillName)} className="ml-1 text-indigo-400 hover:text-indigo-700">×</button>
                  </span>
                ))}
              </div>
            )}

            {categoriesError ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-red-700 text-sm font-medium mb-2">Could not load skill categories.</p>
                <button onClick={() => {
                  setCategoriesError(false)
                  getCategories().then(d => setCategories(Array.isArray(d) ? d : [])).catch(() => setCategoriesError(true))
                }} className="text-red-600 font-semibold text-sm underline">
                  Try Again
                </button>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                <p className="text-zinc-400 text-sm">Loading skills…</p>
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map(cat => (
                  <div key={cat.id} className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
                    <button onClick={() => setOpenCategory(openCategory === cat.id ? null : cat.id)}
                      className="w-full flex items-center justify-between p-4">
                      <span className="font-semibold">{cat.name}</span>
                      <span className="material-symbols-outlined text-zinc-400">
                        {openCategory === cat.id ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                    {openCategory === cat.id && (
                      <div className="border-t border-zinc-100 p-4 space-y-3">
                        {cat.skills.map(skill => {
                          const sel = selectedSkills.find(s => s.skillId === skill.id)
                          return (
                            <div key={skill.id}>
                              <button onClick={() => toggleSkill(skill.id, skill.name)}
                                className={'w-full text-left flex items-center justify-between p-3 rounded-xl transition-colors ' +
                                  (sel ? 'bg-indigo-50 border border-indigo-200' : 'bg-zinc-50 border border-zinc-100')}>
                                <span className={'font-medium text-sm ' + (sel ? 'text-primary' : 'text-on-surface')}>{skill.name}</span>
                                {sel && <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
                              </button>
                              {sel && (
                                <div className="mt-2 pl-3 grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-xs text-zinc-500">Experience (years)</label>
                                    <input type="number" min="0" max="50" value={sel.experienceYrs}
                                      onChange={e => updateSkill(skill.id, 'experienceYrs', Math.max(0, parseInt(e.target.value) || 0))}
                                      className="w-full border border-zinc-200 rounded-lg p-2 text-sm mt-1" />
                                  </div>
                                  <div>
                                    <label className="text-xs text-zinc-500">Proficiency</label>
                                    <select value={sel.proficiency} onChange={e => updateSkill(skill.id, 'proficiency', e.target.value)}
                                      className="w-full border border-zinc-200 rounded-lg p-2 text-sm mt-1">
                                      <option value="beginner">Beginner</option>
                                      <option value="intermediate">Intermediate</option>
                                      <option value="expert">Expert</option>
                                    </select>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 3 — Pricing */}
        {step === 3 && (
          <div>
            <p className="text-sm text-on-surface-variant mb-4">Set your rates for each skill (in ₹). You can update these later.</p>
            {pricing.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-zinc-100">
                <span className="material-symbols-outlined text-4xl text-zinc-300 mb-2 block">arrow_back</span>
                <p className="text-zinc-500 text-sm">Go back and select at least one skill first.</p>
                <button onClick={() => setStep(2)} className="mt-3 text-primary font-semibold text-sm">← Back to Skills</button>
              </div>
            ) : (
              <div className="space-y-4">
                {pricing.map(p => {
                  const amt = parseFloat(p.amount)
                  const invalidAmt = p.amount !== '' && (isNaN(amt) || amt <= 0)
                  return (
                    <div key={p.skillId} className="bg-white rounded-2xl border border-zinc-100 p-4">
                      <p className="font-semibold mb-3">{p.skillName}</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="text-xs text-zinc-500 mb-1 block">Session Type</label>
                          <div className="flex gap-2">
                            {['hourly', 'package'].map(t => (
                              <button key={t} onClick={() => updatePricing(p.skillId, 'type', t)}
                                className={'flex-1 py-2 rounded-xl border-2 font-semibold text-xs capitalize transition-all ' +
                                  (p.type === t ? 'border-primary bg-indigo-50 text-primary' : 'border-zinc-200 text-zinc-500')}>
                                {t === 'hourly' ? 'Per Session' : 'Package Deal'}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-zinc-500 mb-1 block">Price (₹) <span className="text-red-400">*</span></label>
                          <input type="number" min="1" value={p.amount}
                            onChange={e => updatePricing(p.skillId, 'amount', e.target.value)}
                            placeholder="e.g. 500"
                            className={'w-full border rounded-xl p-2.5 text-sm ' + (invalidAmt ? 'border-red-400 bg-red-50' : 'border-zinc-200')} />
                          {invalidAmt && <p className="text-red-500 text-xs mt-1">Enter a valid price greater than ₹0</p>}
                        </div>
                        <div>
                          <label className="text-xs text-zinc-500 mb-1 block">Duration (min)</label>
                          <input type="number" min="15" value={p.durationMins}
                            onChange={e => updatePricing(p.skillId, 'durationMins', e.target.value)}
                            className="w-full border border-zinc-200 rounded-xl p-2.5 text-sm" />
                        </div>
                        {p.type === 'package' && (
                          <div>
                            <label className="text-xs text-zinc-500 mb-1 block">No. of Sessions</label>
                            <input type="number" min="2" value={p.sessions}
                              onChange={e => updatePricing(p.skillId, 'sessions', e.target.value)}
                              className="w-full border border-zinc-200 rounded-xl p-2.5 text-sm" />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* STEP 4 — Availability */}
        {step === 4 && (
          <div>
            <p className="text-sm text-on-surface-variant mb-4">Add your weekly recurring time slots so learners can book you.</p>

            <div className="bg-white rounded-2xl border border-zinc-100 p-4 mb-4">
              <p className="font-semibold text-sm mb-3">Add a Time Slot</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Day</label>
                  <select value={newSlot.dayOfWeek} onChange={e => setNewSlot(prev => ({ ...prev, dayOfWeek: parseInt(e.target.value) }))}
                    className="w-full border border-zinc-200 rounded-xl p-2 text-sm">
                    {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Start</label>
                  <input type="time" value={newSlot.startTime} onChange={e => setNewSlot(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full border border-zinc-200 rounded-xl p-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">End</label>
                  <input type="time" value={newSlot.endTime} onChange={e => setNewSlot(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full border border-zinc-200 rounded-xl p-2 text-sm" />
                </div>
              </div>
              {slotError && <p className="text-red-500 text-xs mb-2">{slotError}</p>}
              <button onClick={addSlot}
                className="w-full py-2.5 bg-primary text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">add</span>
                Add Slot
              </button>
            </div>

            {slots.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                <span className="material-symbols-outlined text-amber-500 text-3xl mb-1 block">schedule</span>
                <p className="text-amber-700 text-sm font-medium">No slots added yet</p>
                <p className="text-amber-600 text-xs mt-1">Learners won't be able to book you without availability. Add at least one slot above.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">{slots.length} slot{slots.length !== 1 ? 's' : ''} added</p>
                {slots.map((slot, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white rounded-xl border border-zinc-100 p-3">
                    <div className="flex items-center gap-3">
                      <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-lg">{DAYS[slot.dayOfWeek]}</span>
                      <span className="text-zinc-600 text-sm">{slot.startTime} – {slot.endTime}</span>
                    </div>
                    <button onClick={() => removeSlot(idx)} className="text-zinc-300 hover:text-red-400 transition-colors">
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-100 p-4">
        <div className="max-w-lg mx-auto flex gap-3">
          {step > 1 && (
            <button onClick={() => { setStep(s => s - 1); setError('') }}
              className="px-6 py-4 border border-zinc-200 rounded-2xl font-semibold text-on-surface-variant">
              Back
            </button>
          )}
          {step < 4 ? (
            <button onClick={() => { setError(''); setStep(s => s + 1) }}
              disabled={
                (step === 1 && (!bio.trim() || !city.trim())) ||
                (step === 2 && selectedSkills.length === 0) ||
                (step === 3 && !pricingValid)
              }
              className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl text-lg disabled:opacity-40">
              Continue
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl text-lg disabled:opacity-60 flex items-center justify-center gap-3">
              {submitting ? (
                <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /><span>Setting up your profile…</span></>
              ) : 'Submit & Go to Dashboard'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
