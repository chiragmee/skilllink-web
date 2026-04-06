'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import BottomNav from '@/components/BottomNav'
import TopBar from '@/components/TopBar'
import { getCategories, searchExperts, type Expert, type SkillCategory } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

type ModeFilter = 'all' | 'online' | 'offline' | 'both'

const MODE_OPTIONS: Array<{ value: ModeFilter; label: string }> = [
  { value: 'all', label: 'All Modes' },
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'both', label: 'Both' },
]

function getLowestPrice(expert: Expert) {
  if (!expert.pricing.length) return null
  return Math.min(...expert.pricing.map((pricing) => pricing.amount))
}

function getTopSkill(expert: Expert) {
  return expert.expertSkills[0]?.skill.name ?? 'General Coaching'
}

export default function Homepage() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<SkillCategory[]>([])
  const [allExperts, setAllExperts] = useState<Expert[]>([])
  const [experts, setExperts] = useState<Expert[]>([])
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  const [mode, setMode] = useState<ModeFilter>('all')
  const [maxPrice, setMaxPrice] = useState(100000)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  const maxAvailablePrice = useMemo(() => {
    if (!allExperts.length) return 100000
    return Math.max(...allExperts.map((expert) => getLowestPrice(expert) ?? 0), 10000)
  }, [allExperts])

  useEffect(() => {
    setMaxPrice(maxAvailablePrice)
  }, [maxAvailablePrice])

  async function loadCategories() {
    try {
      const data = await getCategories()
      setCategories(Array.isArray(data) ? data : [])
    } catch {
      setCategories([])
    }
  }

  async function runSearch(nextQuery?: string) {
    setLoading(true)
    setFetchError('')

    try {
      const params: Record<string, string> = { page: '1', limit: '24' }
      const skillValue = typeof nextQuery === 'string' ? nextQuery.trim() : query.trim()

      if (skillValue) params.skill = skillValue
      if (activeCategory) params.category = activeCategory
      if (mode !== 'all') params.mode = mode

      const result = await searchExperts(params)
      const fetchedExperts = Array.isArray(result.experts) ? result.experts : []
      setAllExperts(fetchedExperts)
    } catch {
      setAllExperts([])
      setFetchError('Unable to load experts right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    runSearch('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, mode])

  useEffect(() => {
    const filtered = allExperts.filter((expert) => {
      const lowestPrice = getLowestPrice(expert) ?? 0
      return lowestPrice <= maxPrice
    })
    setExperts(filtered)
  }, [allExperts, maxPrice])

  return (
    <div className="min-h-screen bg-background pb-28">
      <TopBar
        variant="home"
        searchValue={query}
        onSearchChange={setQuery}
        onSearchSubmit={() => runSearch()}
        searchPlaceholder="Search by skill (Yoga, Guitar, Coding...)"
      />

      <main className="app-shell px-4 pt-5 sm:px-6">
        <section className="rounded-3xl bg-card p-4 shadow-card sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">Find The Right Expert</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            Book trusted coaches around you
          </h1>

          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Categories</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveCategory('')}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  activeCategory === '' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.slug)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
                    activeCategory === category.slug ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Mode</p>
              <div className="flex flex-wrap gap-2">
                {MODE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setMode(option.value)}
                    className={`rounded-xl px-3 py-2 text-sm font-medium ${
                      mode === option.value ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Max Price</p>
                <p className="text-sm font-semibold text-slate-700">
                  Up to Rs {(maxPrice / 100).toLocaleString('en-IN')}
                </p>
              </div>
              <input
                type="range"
                min={0}
                max={Math.max(maxAvailablePrice, 10000)}
                step={500}
                value={maxPrice}
                onChange={(event) => setMaxPrice(Number(event.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200"
              />
            </div>
          </div>
        </section>

        <section className="mt-6">
          {fetchError && !loading && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-700">{fetchError}</p>
              <button
                onClick={() => runSearch()}
                className="mt-3 inline-flex rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Try Again
              </button>
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((skeleton) => (
                <div key={skeleton} className="h-40 animate-pulse rounded-2xl bg-white shadow-card" />
              ))}
            </div>
          )}

          {!loading && !fetchError && experts.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card">
              <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">No experts found</h2>
              <p className="mt-1 text-sm text-slate-500">
                Try a different skill, mode, or price range to find more experts.
              </p>
            </div>
          )}

          {!loading && !fetchError && experts.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {experts.map((expert) => {
                const lowestPrice = getLowestPrice(expert)
                const topSkill = getTopSkill(expert)

                return (
                  <article key={expert.id} className="rounded-2xl bg-white p-4 shadow-card">
                    <div className="flex items-start gap-3">
                      {expert.user.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={expert.user.avatarUrl}
                          alt={expert.user.name ?? 'Expert'}
                          className="h-14 w-14 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                          <span className="material-symbols-outlined">person</span>
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-semibold text-slate-900">{expert.user.name ?? 'Expert'}</h3>
                        <p className="truncate text-sm font-medium text-primary">{topSkill}</p>
                        <p className="mt-1 text-xs text-slate-500">{expert.city || 'Location not specified'}</p>
                      </div>

                      <div className="rounded-lg bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                        {expert.totalReviews > 0 ? `${Number(expert.avgRating).toFixed(1)} (${expert.totalReviews})` : 'New'}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Starting from</p>
                        <p className="text-lg font-semibold text-slate-900">
                          {lowestPrice !== null ? `Rs ${(lowestPrice / 100).toLocaleString('en-IN')}` : 'Ask for price'}
                        </p>
                      </div>

                      <Link
                        href={`/expert/${expert.id}`}
                        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
                      >
                        Book
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </main>

      <BottomNav mode={user?.expertProfileId ? 'expert' : 'learner'} />
    </div>
  )
}
