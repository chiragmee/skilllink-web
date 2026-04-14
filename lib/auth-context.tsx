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
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshUser: async () => {},
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

  async function refreshUser() {
    const token = window.localStorage.getItem('skilllink_token')
    if (!token) return
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const { data } = await res.json()
      const updated: AuthUser = {
        id: data.id,
        name: data.name,
        email: data.email,
        avatarUrl: data.avatarUrl,
        role: data.role,
        expertProfileId: data.expertProfile?.id ?? null,
      }
      window.localStorage.setItem('skilllink_user', JSON.stringify(updated))
      setUser(updated)
    } catch {}
  }

  async function signOut() {
    window.localStorage.removeItem('skilllink_token')
    window.localStorage.removeItem('skilllink_user')
    setUser(null)

    try {
      await supabase.auth.signOut()
    } finally {
      window.location.assign('/')
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
