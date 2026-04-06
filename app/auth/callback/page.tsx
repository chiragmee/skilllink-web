'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    // Exchange the OAuth code for a Supabase session.
    // onAuthStateChange in AuthProvider will fire SIGNED_IN which triggers
    // token exchange with our backend. We listen here for the session to
    // be established before redirecting so we don't race.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
          subscription.unsubscribe()
          router.replace('/')
        }
      }
    )

    // Kick off the session exchange (Supabase auto-reads the code from URL)
    supabase.auth.getSession().then(({ data: { session } }) => {
      // If session already available (e.g. code already exchanged), redirect now
      if (session) {
        subscription.unsubscribe()
        router.replace('/')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-on-surface-variant">Completing sign in…</p>
      </div>
    </div>
  )
}
