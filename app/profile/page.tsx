'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TopBar from '@/components/TopBar'
import { useAuth } from '@/lib/auth-context'

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading, signOut } = useAuth()

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [loading, router, user])

  async function handleSignOut() {
    try {
      await signOut()
    } catch {}
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar variant="back" backHref="/" title="Profile" />

      <main className="mx-auto mt-5 w-full max-w-xl px-4 pb-10 sm:px-6">
        <section className="rounded-3xl bg-white p-6 shadow-card">
          <div className="flex items-center gap-4">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt={user.name ?? 'User'} className="h-16 w-16 rounded-2xl object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                <span className="material-symbols-outlined text-3xl">person</span>
              </div>
            )}

            <div>
              <h1 className="text-xl font-semibold text-slate-900">{user.name ?? 'User'}</h1>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>
        </section>

        <section className="mt-4 space-y-3 rounded-3xl bg-white p-4 shadow-card">
          {user.expertProfileId ? (
            <Link href="/dashboard" className="block rounded-xl bg-indigo-50 px-4 py-3 text-sm font-semibold text-primary">
              Expert Dashboard
            </Link>
          ) : (
            <Link href="/register-expert" className="block rounded-xl bg-indigo-50 px-4 py-3 text-sm font-semibold text-primary">
              Become an Expert
            </Link>
          )}

          <button
            onClick={handleSignOut}
            className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
          >
            Sign Out
          </button>
        </section>
      </main>
    </div>
  )
}
