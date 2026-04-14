'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCategories, searchExperts, type Expert, type SkillCategory } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

type ModeFilter = 'all' | 'online' | 'offline' | 'both'

const MODE_OPTIONS: Array<{ value: ModeFilter; label: string }> = [
  { value: 'all', label: 'All' },
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
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [categories, setCategories] = useState<SkillCategory[]>([])
  const [allExperts, setAllExperts] = useState<Expert[]>([])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])
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
      setAllExperts(Array.isArray(result.experts) ? result.experts : [])
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
    setExperts(allExperts.filter((expert) => (getLowestPrice(expert) ?? 0) <= maxPrice))
  }, [allExperts, maxPrice])

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-7">
            <Link href="/" className="text-xl font-bold text-primary">SkillLink</Link>
            <nav className="hidden items-center gap-5 text-xs font-medium text-slate-500 md:flex">
              <Link href="/" className="border-b-2 border-primary pb-1 text-primary">Experts</Link>
              <span>Badminton</span>
              <span>Music</span>
              <span>Fitness</span>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden rounded-full bg-slate-100 px-4 py-2 text-xs text-slate-500 lg:block">
              What do you want to learn?
            </button>
            {user ? (
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm"
                >
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt={user.name ?? 'Profile'} className="h-full w-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-[18px] text-slate-500">person</span>
                  )}
                </button>
                {menuOpen && (
                  <div
                    ref={menuRef}
                    className="absolute right-0 top-11 z-50 min-w-[160px] rounded-2xl border border-slate-200 bg-white py-1 shadow-lg"
                    onMouseLeave={() => setMenuOpen(false)}
                  >
                    <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50">
                      <span className="material-symbols-outlined text-[18px]">person</span>Profile
                    </Link>
                    <button
                      onClick={async () => { setMenuOpen(false); await signOut(); router.replace('/login') }}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white">Sign In</Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6">
        <section className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            Master any skill with <span className="italic text-primary">Top Experts</span>
          </h1>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              runSearch()
            }}
            className="mx-auto mt-7 flex max-w-2xl items-center rounded-full border border-slate-200 bg-white p-2 shadow-[0_20px_40px_rgba(25,28,29,0.06)]"
          >
            <span className="material-symbols-outlined ml-3 text-primary">search</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="What do you want to learn?"
              className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
            />
            <button type="submit" className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white">
              Search
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setActiveCategory('')}
              className={`rounded-full px-4 py-2 text-xs font-semibold ${
                activeCategory === '' ? 'bg-amber-300 text-slate-900' : 'bg-slate-200 text-slate-600'
              }`}
            >
              Sports
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.slug)}
                className={`rounded-full px-4 py-2 text-xs font-semibold ${
                  activeCategory === category.slug ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {MODE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setMode(option.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  mode === option.value ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="mx-auto mt-4 max-w-sm">
            <p className="mb-1 text-xs font-medium text-slate-500">Max Price: Rs {(maxPrice / 100).toLocaleString('en-IN')}</p>
            <input
              type="range"
              min={0}
              max={Math.max(maxAvailablePrice, 10000)}
              step={500}
              value={maxPrice}
              onChange={(event) => setMaxPrice(Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-300"
            />
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Recommended</p>
              <h2 className="text-3xl font-extrabold">Top Experts</h2>
            </div>
            <Link href="/" className="text-sm font-semibold text-primary">View all experts</Link>
          </div>

          {fetchError && !loading && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{fetchError}</div>
          )}

          {loading && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-72 animate-pulse rounded-3xl bg-white" />
              ))}
            </div>
          )}

          {!loading && !fetchError && experts.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <h3 className="text-lg font-semibold">No experts found</h3>
              <p className="mt-1 text-sm text-slate-500">Try adjusting your search or filters.</p>
            </div>
          )}

          {!loading && !fetchError && experts.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {experts.map((expert) => {
                const lowestPrice = getLowestPrice(expert)
                return (
                  <article key={expert.id} className="rounded-3xl bg-white p-5 shadow-[0_20px_40px_rgba(25,28,29,0.06)]">
                    <div className="mb-4 flex justify-center">
                      {expert.user.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={expert.user.avatarUrl}
                          alt={expert.user.name ?? 'Expert'}
                          className="h-24 w-24 rounded-full object-cover ring-4 ring-indigo-50"
                        />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-100 text-indigo-500">
                          <span className="material-symbols-outlined text-3xl">person</span>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold">{expert.user.name ?? 'Expert'}</h3>
                      <p className="mt-1 text-xs italic text-slate-500">{getTopSkill(expert)}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        ★ {expert.totalReviews > 0 ? Number(expert.avgRating).toFixed(1) : 'New'} ({expert.totalReviews})
                      </p>
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <div>
                        <p className="text-[10px] text-slate-500">Starting at</p>
                        <p className="text-lg font-extrabold text-primary">
                          {lowestPrice !== null ? `Rs ${(lowestPrice / 100).toLocaleString('en-IN')}` : 'NA'}
                        </p>
                      </div>
                      <Link href={`/expert/${expert.id}`} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-primary">
                        View Profile
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </main>

      <footer className="mt-14 bg-slate-100 px-4 py-10 sm:px-6">
        <div className="mx-auto grid w-full max-w-[1280px] grid-cols-2 gap-6 md:grid-cols-4">
          <div className="col-span-2">
            <p className="text-lg font-bold text-primary">SkillLink</p>
            <p className="mt-3 max-w-xs text-xs text-slate-500">
              Connecting passionate learners with world-class experts across sports, music and more.
            </p>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold">Company</p>
            <p className="text-xs text-slate-500">About Us</p>
            <p className="mt-1 text-xs text-slate-500">Safety</p>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold">Support</p>
            <p className="text-xs text-slate-500">Help Center</p>
            <p className="mt-1 text-xs text-slate-500">Privacy Policy</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
