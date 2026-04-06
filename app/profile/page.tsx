'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import TopBar from '@/components/TopBar'
import { useAuth } from '@/lib/auth-context'

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth()

  const router = useRouter()

  async function handleSignOut() {
    try { await signOut() } catch {}
    router.replace('/login')
  }

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="bg-surface min-h-screen pb-28">
      <TopBar variant="back" />
      <main className="mt-16 max-w-lg mx-auto px-4">
        <div className="bg-white rounded-3xl p-6 mt-4 border border-zinc-100 flex items-center gap-4">
          <div className="w-16 h-16 flex-shrink-0">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name||''} className="w-full h-full object-cover rounded-2xl"/>
            ) : (
              <div className="w-full h-full bg-indigo-100 rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-indigo-400 text-3xl">person</span>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold">{user.name || 'User'}</h1>
            <p className="text-zinc-500 text-sm">{user.email}</p>
            <span className="inline-block mt-1 bg-indigo-50 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-lg capitalize">{user.role}</span>
          </div>
        </div>

        <div className="mt-4 bg-white rounded-3xl border border-zinc-100 overflow-hidden">
          {!user.expertProfileId && (
            <Link href="/register-expert" className="flex items-center justify-between p-5 hover:bg-zinc-50 transition-colors border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-indigo-600">workspace_premium</span>
                </div>
                <div>
                  <p className="font-semibold">Become an Expert</p>
                  <p className="text-zinc-400 text-xs">List your skills and start earning</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-zinc-400">chevron_right</span>
            </Link>
          )}
          {user.expertProfileId && (
            <Link href="/dashboard" className="flex items-center justify-between p-5 hover:bg-zinc-50 transition-colors border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-600">dashboard</span>
                </div>
                <p className="font-semibold">Expert Dashboard</p>
              </div>
              <span className="material-symbols-outlined text-zinc-400">chevron_right</span>
            </Link>
          )}
          <Link href="/bookings" className="flex items-center justify-between p-5 hover:bg-zinc-50 transition-colors border-b border-zinc-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600">calendar_month</span>
              </div>
              <p className="font-semibold">My Bookings</p>
            </div>
            <span className="material-symbols-outlined text-zinc-400">chevron_right</span>
          </Link>
          <Link href="/terms-of-service" className="flex items-center justify-between p-5 hover:bg-zinc-50 transition-colors border-b border-zinc-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-zinc-600">gavel</span>
              </div>
              <p className="font-semibold">Terms of Service</p>
            </div>
            <span className="material-symbols-outlined text-zinc-400">chevron_right</span>
          </Link>
          <Link href="/privacy-policy" className="flex items-center justify-between p-5 hover:bg-zinc-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-zinc-600">privacy_tip</span>
              </div>
              <p className="font-semibold">Privacy Policy</p>
            </div>
            <span className="material-symbols-outlined text-zinc-400">chevron_right</span>
          </Link>
        </div>

        <button onClick={handleSignOut}
          className="mt-4 w-full py-4 bg-red-50 text-red-600 font-bold rounded-2xl border border-red-200 hover:bg-red-100 transition-colors">
          Sign Out
        </button>
      </main>
      <BottomNav mode={user.expertProfileId ? 'expert' : 'learner'} />
    </div>
  )
}
