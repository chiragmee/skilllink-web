'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authenticateWithGoogle } from '@/lib/api'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function completeSignIn() {
      try {
        const authCode = new URLSearchParams(window.location.search).get('code')

        if (authCode) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(authCode)
          if (exchangeError) throw exchangeError
        }

        const { data, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError

        const supabaseToken = data.session?.access_token
        if (!supabaseToken) {
          throw new Error('We could not complete sign in. Please try again.')
        }

        const authData = await authenticateWithGoogle(supabaseToken)

        if (cancelled) return

        window.localStorage.setItem('skilllink_token', authData.accessToken)
        window.localStorage.setItem('skilllink_user', JSON.stringify(authData.user))

        router.replace(authData.user.expertProfileId ? '/dashboard' : '/')
      } catch {
        if (!cancelled) {
          setError('We could not complete Google sign in. Please try again.')
        }
      }
    }

    completeSignIn()

    return () => {
      cancelled = true
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm rounded-3xl bg-card p-8 text-center shadow-card">
        {error ? (
          <>
            <h1 className="text-xl font-semibold text-slate-900">Sign-in failed</h1>
            <p className="mt-3 text-sm text-slate-500">{error}</p>
            <button
              onClick={() => router.replace('/login')}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-white"
            >
              Back to login
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            <h1 className="mt-5 text-xl font-semibold text-slate-900">Completing sign in</h1>
            <p className="mt-2 text-sm text-slate-500">Please wait while we connect your account.</p>
          </>
        )}
      </div>
    </div>
  )
}
