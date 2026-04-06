'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface AuthUser {
  id: string
  name: string | null
  email: string | null
  avatarUrl: string | null
  role: string
  expertProfileId: string | null
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const savedToken = window.localStorage.getItem('skilllink_token')
    const savedUser = window.localStorage.getItem('skilllink_user')

    if (savedToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        window.localStorage.removeItem('skilllink_user')
        window.localStorage.removeItem('skilllink_token')
      }
    }

    setLoading(false)
  }, [])

  async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: true,
      },
    })

    if (error) {
      throw error
    }

    if (!data?.url) {
      throw new Error('Could not start Google sign in. Please try again.')
    }

    window.location.assign(data.url)
  }

  async function signOut() {
    window.localStorage.removeItem('skilllink_token')
    window.localStorage.removeItem('skilllink_user')
    setUser(null)

    try {
      await supabase.auth.signOut()
    } finally {
      window.location.assign('/login')
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
