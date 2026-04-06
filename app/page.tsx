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

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error)
    loadExperts()
  }, [])

  async function loadExperts(skill = '', category = '') {
    setLoading(true)
    try {
      const params: Record<string, string> = { page: '1', limit: '10' }
      if (skill) params.skill = skill
      if (category) params.category = category
      const data = await searchExperts(params)
      setExperts(data.experts || [])
    } catch {
      setExperts([])
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    loadExperts(query)
  }

  function handleCategory(cat: SkillCategory) {
    const next = activeCategory === cat.slug ? '' : cat.slug
    setActiveCategory(next)
    loadExperts('', next)
  }

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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight">Popular Categories</h2>
            </div>
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
                {activeCategory || query ? 'Results' : 'Experts'}
              </h2>
              <p className="text-zinc-500 text-sm mt-1">
                {loading ? 'Loading…' : `${experts.length} expert${experts.length !== 1 ? 's' : ''} found`}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-surface-container-lowest rounded-[24px] p-5 h-36 animate-pulse" />
              ))}
            </div>
          ) : experts.length === 0 ? (
            <div className="text-center py-16 text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl mb-4 block">search_off</span>
              <p className="font-semibold text-lg">No experts found</p>
              <p className="text-sm mt-1">Try a different skill or category</p>
            </div>
          ) : (
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
                      <div className="relative w-24 h-24 flex-shrink-0">
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
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-bold text-on-surface">
                              {expert.user.name || 'Expert'}
                            </h3>
                            <p className="text-primary text-sm font-semibold">{skillNames || 'Multiple Skills'}</p>
                            {expert.city && (
                              <p className="text-zinc-400 text-xs mt-0.5 flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">location_on</span>
                                {expert.city}
                              </p>
                            )}
                          </div>
                          {expert.totalReviews > 0 && (
                            <div className="flex items-center gap-1 bg-secondary-fixed text-on-secondary-fixed px-2 py-1 rounded-lg">
                              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                              <span className="text-xs font-bold">{Number(expert.avgRating).toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div>
                            {minPrice !== null ? (
                              <>
                                <span className="text-zinc-400 text-xs uppercase font-bold tracking-widest block mb-1">From</span>
                                <span className="text-xl font-extrabold text-on-surface">
                                  ₹{(minPrice / 100).toLocaleString('en-IN')}
                                </span>
                              </>
                            ) : (
                              <span className="text-zinc-400 text-sm">No pricing set</span>
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
