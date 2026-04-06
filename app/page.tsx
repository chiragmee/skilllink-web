'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import TopBar from '@/components/TopBar'
import BottomNav from '@/components/BottomNav'
import { searchExperts, getCategories, type Expert, type SkillCategory } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

export default function DiscoverPage() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [experts, setExperts] = useState<Expert[]>([])
  const [categories, setCategories] = useState<SkillCategory[]>([])
  const [activeCategory, setActiveCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {/* categories optional */})
    loadExperts()
  }, [])

  async function loadExperts(skill = '', category = '') {
    setLoading(true)
    setFetchError('')
    try {
      const params: Record<string, string> = { page: '1', limit: '20' }
      if (skill) params.skill = skill
      if (category) params.category = category
      const data = await searchExperts(params)
      setExperts(data.experts || [])
    } catch {
      setFetchError('Could not load experts. Please check your connection and try again.')
      setExperts([])
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    loadExperts(trimmed)
  }

  function handleCategory(cat: SkillCategory) {
    const next = activeCategory === cat.slug ? '' : cat.slug
    setActiveCategory(next)
    loadExperts('', next)
  }

  const isFiltered = !!activeCategory || !!query.trim()

  return (
    <div className="bg-surface text-on-surface antialiased pb-28 min-h-screen">
      <TopBar variant="home" />

      <main className="mt-20 px-6 max-w-5xl mx-auto">
        {/* Hero */}
        <section className="py-8">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.05em] text-indigo-700 font-semibold mb-2">
              Empowering Local Talent
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight leading-tight mb-6">
              Master any skill,{' '}
              <br />
              <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
                right in your neighborhood.
              </span>
            </h1>
          </div>

          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-zinc-400">search</span>
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-16 pl-14 pr-36 bg-surface-container-high border-none rounded-2xl focus:ring-2 focus:ring-primary/20 text-lg font-medium placeholder:text-zinc-400 transition-all outline-none"
              placeholder="Find a skill (e.g., Badminton, Yoga)"
            />
            <button
              type="submit"
              className="absolute right-3 top-3 bottom-3 px-6 bg-secondary text-white font-bold rounded-xl shadow-lg hover:scale-[0.98] transition-transform flex items-center gap-2"
            >
              Search
            </button>
          </form>
        </section>

        {/* Categories */}
        {categories.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold tracking-tight mb-4">Popular Categories</h2>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-6 px-6">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategory(cat)}
                  className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-colors ${
                    activeCategory === cat.slug
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold'
                      : 'bg-white hover:bg-surface-container-low text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">
                    {cat.slug === 'sports' ? 'sports_tennis' :
                     cat.slug === 'music' ? 'music_note' :
                     cat.slug === 'tech' ? 'code' :
                     cat.slug === 'fitness' ? 'self_improvement' :
                     cat.slug === 'cooking' ? 'restaurant' : 'brush'}
                  </span>
                  {cat.name}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Register as Expert CTA */}
        {user && !user.expertProfileId && (
          <section className="mb-8">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white flex items-center justify-between">
              <div>
                <p className="font-bold text-lg">Are you an expert?</p>
                <p className="text-indigo-200 text-sm mt-1">List your skills and start earning</p>
              </div>
              <Link
                href="/register-expert"
                className="bg-white text-indigo-700 font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors flex-shrink-0"
              >
                Register →
              </Link>
            </div>
          </section>
        )}

        {/* Experts Grid */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">
                {isFiltered ? 'Search Results' : 'Experts Near You'}
              </h2>
              {!loading && !fetchError && (
                <p className="text-zinc-500 text-sm mt-1">
                  {experts.length === 0
                    ? isFiltered ? 'No experts found for this search' : 'No experts yet'
                    : `${experts.length} expert${experts.length !== 1 ? 's' : ''} found`}
                </p>
              )}
            </div>
            {isFiltered && (
              <button
                onClick={() => { setQuery(''); setActiveCategory(''); loadExperts() }}
                className="text-sm text-primary font-semibold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">close</span>
                Clear
              </button>
            )}
          </div>

          {/* Error state */}
          {fetchError && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
              <span className="material-symbols-outlined text-red-400 text-4xl mb-2 block">wifi_off</span>
              <p className="text-red-700 font-semibold">{fetchError}</p>
              <button
                onClick={() => loadExperts(query, activeCategory)}
                className="mt-3 px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-surface-container-lowest rounded-[24px] p-5 h-36 animate-pulse" />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !fetchError && experts.length === 0 && (
            <div className="text-center py-16 text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl mb-4 block">search_off</span>
              <p className="font-semibold text-lg">
                {isFiltered ? `No experts found for "${query || activeCategory}"` : 'No experts yet'}
              </p>
              <p className="text-sm mt-2 text-zinc-400">
                {isFiltered ? 'Try a different skill or category' : 'Check back soon — experts are signing up!'}
              </p>
              {isFiltered && (
                <button
                  onClick={() => { setQuery(''); setActiveCategory(''); loadExperts() }}
                  className="mt-4 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold"
                >
                  See All Experts
                </button>
              )}
            </div>
          )}

          {/* Expert cards */}
          {!loading && !fetchError && experts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {experts.map((expert) => {
                const minPrice = expert.pricing.length > 0
                  ? Math.min(...expert.pricing.map((p) => p.amount))
                  : null
                const skillNames = expert.expertSkills.map((es) => es.skill.name).slice(0, 2).join(', ')
                return (
                  <div
                    key={expert.id}
                    className="bg-surface-container-lowest rounded-[24px] p-5 shadow-editorial group hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex gap-5">
                      <div className="w-24 h-24 flex-shrink-0">
                        {expert.user.avatarUrl ? (
                          <img
                            src={expert.user.avatarUrl}
                            alt={expert.user.name || 'Expert'}
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        ) : (
                          <div className="w-full h-full bg-indigo-100 rounded-2xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-indigo-400 text-4xl">person</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="min-w-0">
                            <h3 className="text-lg font-bold text-on-surface truncate">
                              {expert.user.name || 'Expert'}
                            </h3>
                            <p className="text-primary text-sm font-semibold truncate">{skillNames || 'Multiple Skills'}</p>
                            {expert.city && (
                              <p className="text-zinc-400 text-xs mt-0.5 flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">location_on</span>
                                {expert.city}
                              </p>
                            )}
                          </div>
                          {expert.totalReviews > 0 && (
                            <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-lg flex-shrink-0 ml-2">
                              <span className="material-symbols-outlined text-sm text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                              <span className="text-xs font-bold">{Number(expert.avgRating).toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div>
                            {minPrice !== null ? (
                              <>
                                <span className="text-zinc-400 text-xs uppercase font-bold tracking-widest block mb-0.5">From</span>
                                <span className="text-xl font-extrabold text-on-surface">
                                  ₹{(minPrice / 100).toLocaleString('en-IN')}
                                </span>
                              </>
                            ) : (
                              <span className="text-zinc-400 text-sm">Contact for pricing</span>
                            )}
                          </div>
                          <Link
                            href={`/expert/${expert.id}`}
                            className="px-5 py-2.5 bg-indigo-50 text-indigo-700 font-bold rounded-xl group-hover:bg-primary group-hover:text-white transition-colors"
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
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
