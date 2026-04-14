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
        const queryParams = new URLSearchParams(window.location.search)
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
        const authCode = queryParams.get('code')
        const hashAccessToken = hashParams.get('access_token')
        const hashError =
          hashParams.get('error_description') ||
          hashParams.get('error') ||
          queryParams.get('error_description') ||
          queryParams.get('error')

        if (hashError) {
          throw new Error(hashError)
        }

        if (authCode) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(authCode)
          if (exchangeError) throw exchangeError
        }

        const { data, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError

        const supabaseToken = data.session?.access_token || hashAccessToken
        if (!supabaseToken) {
          throw new Error('We could not complete sign in. Please try again.')
        }

        const authData = await authenticateWithGoogle(supabaseToken)

        if (cancelled) return

        window.localStorage.setItem('skilllink_token', authData.accessToken)
        window.localStorage.setItem('skilllink_user', JSON.stringify(authData.user))

        // Return the user to the page they were on when they triggered sign-in.
        // IMPORTANT: use window.location.assign (hard navigation) not router.replace.
        // AuthProvider lives in the layout and persists across client-side navigations —
        // its useEffect already ran and won't re-read localStorage without a full reload.
        const returnTo = sessionStorage.getItem('skilllink_return_to')
        sessionStorage.removeItem('skilllink_return_to')

        let redirectPath = authData.user.expertProfileId ? '/dashboard' : '/'
        if (returnTo) {
          try {
            // returnTo is a full URL — extract just the path so we stay on the same origin
            redirectPath = new URL(returnTo).pathname + new URL(returnTo).search
          } catch {
            redirectPath = returnTo
          }
        }

        window.location.assign(redirectPath)
      } catch (caughtError) {
        console.error('[AuthCallback] sign-in failed:', caughtError)
        if (!cancelled) {
          const message =
            caughtError instanceof Error && caughtError.message
              ? caughtError.message
              : 'We could not complete Google sign in. Please try again.'
          setError(message)
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
