'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    // Supabase client auto-exchanges the code from URL params
    supabase.auth.getSession().then(() => {
      // onAuthStateChange in AuthProvider handles the rest
      // Give it a moment to process
      setTimeout(() => router.replace('/'), 500)
    })
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
