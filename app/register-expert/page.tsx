'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import TopBar from '@/components/TopBar'
import {
  addExpertPricing,
  addExpertSkill,
  createExpertProfile,
  getCategories,
  setAvailability,
  type SkillCategory,
} from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

type Mode = 'online' | 'offline' | 'both'
type Proficiency = 'beginner' | 'intermediate' | 'expert'
type PricingType = 'hourly' | 'package'

interface SelectedSkill {
  skillId: string
  skillName: string
  experienceYrs: number
  proficiency: Proficiency
}

interface PricingSetup {
  skillId: string
  type: PricingType
  amount: string
  durationMins: string
}

const DAYS = [
  { label: 'Mon', value: 0 },
  { label: 'Tue', value: 1 },
  { label: 'Wed', value: 2 },
  { label: 'Thu', value: 3 },
  { label: 'Fri', value: 4 },
  { label: 'Sat', value: 5 },
  { label: 'Sun', value: 6 },
]

export default function RegisterExpertPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const [step, setStep] = useState(1)
  const [categories, setCategories] = useState<SkillCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [openCategory, setOpenCategory] = useState<string | null>(null)

  const [bio, setBio] = useState('')
  const [city, setCity] = useState('')
  const [mode, setMode] = useState<Mode>('online')

  const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>([])
  const [pricing, setPricing] = useState<PricingSetup[]>([])
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
      return
    }
    if (!loading && user?.expertProfileId) {
      router.replace('/dashboard')
      return
    }
  }, [loading, router, user])

  useEffect(() => {
    let mounted = true

    async function loadCategories() {
      setLoadingCategories(true)
      try {
        const data = await getCategories()
        if (mounted) setCategories(Array.isArray(data) ? data : [])
      } catch {
        if (mounted) setCategories([])
      } finally {
        if (mounted) setLoadingCategories(false)
      }
    }

    loadCategories()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    setPricing((current) =>
      selectedSkills.map((skill) => {
        const existing = current.find((entry) => entry.skillId === skill.skillId)
        return (
          existing ?? {
            skillId: skill.skillId,
            type: 'hourly',
            amount: '',
            durationMins: '60',
          }
        )
      }),
    )
  }, [selectedSkills])

  const canContinue = useMemo(() => {
    if (step === 1) return bio.trim().length > 20 && city.trim().length > 1
    if (step === 2) return selectedSkills.length > 0
    if (step === 3) {
      const validPricing = pricing.every((entry) => Number(entry.amount) > 0 && Number(entry.durationMins) > 0)
      const validAvailability = selectedDays.length > 0 && startTime < endTime
      return validPricing && validAvailability
    }
    return false
  }, [bio, city, endTime, pricing, selectedDays.length, startTime, step, selectedSkills.length])

  function toggleSkill(skillId: string, skillName: string) {
    setSelectedSkills((current) => {
      const exists = current.some((item) => item.skillId === skillId)
      if (exists) return current.filter((item) => item.skillId !== skillId)
      return [...current, { skillId, skillName, experienceYrs: 1, proficiency: 'intermediate' }]
    })
  }

  function updateSelectedSkill(skillId: string, patch: Partial<SelectedSkill>) {
    setSelectedSkills((current) => current.map((item) => (item.skillId === skillId ? { ...item, ...patch } : item)))
  }

  function updatePricing(skillId: string, patch: Partial<PricingSetup>) {
    setPricing((current) => current.map((item) => (item.skillId === skillId ? { ...item, ...patch } : item)))
  }

  function toggleDay(day: number) {
    setSelectedDays((current) => (current.includes(day) ? current.filter((item) => item !== day) : [...current, day]))
  }

  async function handleSubmit() {
    if (!user) return
    setSubmitting(true)
    setError('')

    try {
      const profile = await createExpertProfile({
        bio: bio.trim(),
        city: city.trim(),
        mode,
      })

      if (!profile?.id) throw new Error('Could not create expert profile.')
      const expertId = profile.id

      for (const skill of selectedSkills) {
        await addExpertSkill(expertId, {
          skillId: skill.skillId,
          experienceYrs: skill.experienceYrs,
          proficiency: skill.proficiency,
        })
      }

      for (const entry of pricing) {
        await addExpertPricing(expertId, {
          skillId: entry.skillId,
          type: entry.type,
          amount: Math.round(Number(entry.amount) * 100),
          durationMins: Number(entry.durationMins),
        })
      }

      const availabilityPayload = selectedDays.map((day) => ({
        dayOfWeek: day,
        startTime,
        endTime,
      }))
      await setAvailability(expertId, availabilityPayload)

      const updatedUser = {
        ...user,
        role: user.role === 'learner' ? 'both' : user.role,
        expertProfileId: expertId,
      }
      localStorage.setItem('skilllink_user', JSON.stringify(updatedUser))

      router.replace('/dashboard')
    } catch {
      setError('We could not complete your expert onboarding. Please review details and try again.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopBar variant="back" backHref="/profile" title="Become an Expert" />

      <main className="mx-auto mt-5 w-full max-w-3xl px-4 sm:px-6">
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-card">
          <div className="mb-2 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-slate-900">Expert Onboarding</h1>
            <span className="text-sm font-medium text-slate-500">{step}/3</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((value) => (
              <div key={value} className={`h-2 flex-1 rounded-full ${value <= step ? 'bg-primary' : 'bg-slate-200'}`} />
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {step === 1 && (
          <section className="rounded-2xl bg-white p-5 shadow-card">
            <h2 className="text-lg font-semibold text-slate-900">Step 1: About You</h2>
            <p className="mt-1 text-sm text-slate-500">Share your profile details to help learners discover you.</p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Bio</label>
                <textarea
                  rows={5}
                  maxLength={800}
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-primary"
                  placeholder="Tell learners about your teaching style and experience."
                />
                <p className="mt-1 text-right text-xs text-slate-400">{bio.length}/800</p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">City</label>
                <input
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-primary"
                  placeholder="Mumbai, Bangalore, Pune..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['online', 'offline', 'both'] as const).map((option) => (
                    <button
                      key={option}
                      onClick={() => setMode(option)}
                      className={`rounded-xl border-2 py-2 text-sm font-semibold capitalize ${
                        mode === option ? 'border-primary bg-indigo-50 text-primary' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="rounded-2xl bg-white p-5 shadow-card">
            <h2 className="text-lg font-semibold text-slate-900">Step 2: Skills</h2>
            <p className="mt-1 text-sm text-slate-500">Pick skills and set your experience + proficiency.</p>

            {loadingCategories ? (
              <div className="py-8 text-center text-sm text-slate-500">Loading skills...</div>
            ) : (
              <div className="mt-4 space-y-3">
                {categories.map((category) => (
                  <div key={category.id} className="overflow-hidden rounded-xl border border-slate-200">
                    <button
                      onClick={() => setOpenCategory(openCategory === category.id ? null : category.id)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left"
                    >
                      <span className="text-sm font-semibold text-slate-800">{category.name}</span>
                      <span className="material-symbols-outlined text-slate-500">
                        {openCategory === category.id ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>

                    {openCategory === category.id && (
                      <div className="space-y-3 border-t border-slate-200 p-3">
                        {category.skills.map((skill) => {
                          const selected = selectedSkills.find((entry) => entry.skillId === skill.id)

                          return (
                            <div key={skill.id} className="rounded-xl border border-slate-200 p-3">
                              <button
                                onClick={() => toggleSkill(skill.id, skill.name)}
                                className="flex w-full items-center justify-between"
                              >
                                <span className={`text-sm font-medium ${selected ? 'text-primary' : 'text-slate-700'}`}>
                                  {skill.name}
                                </span>
                                {selected ? (
                                  <span className="material-symbols-outlined text-primary">check_circle</span>
                                ) : (
                                  <span className="material-symbols-outlined text-slate-300">add_circle</span>
                                )}
                              </button>

                              {selected && (
                                <div className="mt-3 grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="mb-1 block text-xs font-medium text-slate-500">Experience (years)</label>
                                    <input
                                      type="number"
                                      min={0}
                                      value={selected.experienceYrs}
                                      onChange={(event) =>
                                        updateSelectedSkill(skill.id, { experienceYrs: Math.max(0, Number(event.target.value) || 0) })
                                      }
                                      className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm outline-none focus:border-primary"
                                    />
                                  </div>
                                  <div>
                                    <label className="mb-1 block text-xs font-medium text-slate-500">Proficiency</label>
                                    <select
                                      value={selected.proficiency}
                                      onChange={(event) => updateSelectedSkill(skill.id, { proficiency: event.target.value as Proficiency })}
                                      className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm outline-none focus:border-primary"
                                    >
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
          </section>
        )}

        {step === 3 && (
          <section className="space-y-4">
            <div className="rounded-2xl bg-white p-5 shadow-card">
              <h2 className="text-lg font-semibold text-slate-900">Step 3: Pricing</h2>
              <p className="mt-1 text-sm text-slate-500">Set your pricing for each selected skill.</p>

              <div className="mt-4 space-y-3">
                {pricing.map((entry) => {
                  const skill = selectedSkills.find((selected) => selected.skillId === entry.skillId)
                  return (
                    <div key={entry.skillId} className="rounded-xl border border-slate-200 p-3">
                      <p className="text-sm font-semibold text-slate-800">{skill?.skillName ?? 'Skill'}</p>
                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <select
                          value={entry.type}
                          onChange={(event) => updatePricing(entry.skillId, { type: event.target.value as PricingType })}
                          className="rounded-lg border border-slate-200 px-2 py-2 text-sm outline-none focus:border-primary"
                        >
                          <option value="hourly">Per Session</option>
                          <option value="package">Package</option>
                        </select>
                        <input
                          type="number"
                          min={1}
                          value={entry.amount}
                          onChange={(event) => updatePricing(entry.skillId, { amount: event.target.value })}
                          placeholder="Amount (Rs)"
                          className="rounded-lg border border-slate-200 px-2 py-2 text-sm outline-none focus:border-primary"
                        />
                        <input
                          type="number"
                          min={15}
                          value={entry.durationMins}
                          onChange={(event) => updatePricing(entry.skillId, { durationMins: event.target.value })}
                          placeholder="Duration (min)"
                          className="rounded-lg border border-slate-200 px-2 py-2 text-sm outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-card">
              <h3 className="text-lg font-semibold text-slate-900">Availability</h3>
              <p className="mt-1 text-sm text-slate-500">Choose recurring days and one time range for weekly slots.</p>

              <div className="mt-4 grid grid-cols-7 gap-2">
                {DAYS.map((day) => {
                  const active = selectedDays.includes(day.value)
                  return (
                    <button
                      key={day.value}
                      onClick={() => toggleDay(day.value)}
                      className={`rounded-xl px-2 py-2 text-xs font-semibold ${
                        active ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {day.label}
                    </button>
                  )
                })}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(event) => setStartTime(event.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(event) => setEndTime(event.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-2 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white p-4">
        <div className="mx-auto flex w-full max-w-3xl gap-3">
          {step > 1 && (
            <button
              onClick={() => {
                setError('')
                setStep((value) => value - 1)
              }}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
            >
              Back
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => {
                setError('')
                setStep((value) => value + 1)
              }}
              disabled={!canContinue}
              className="flex-1 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canContinue || submitting}
              className="flex-1 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit & Go to Dashboard'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
