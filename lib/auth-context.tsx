'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase'

export interface AuthUser {
  id: string
  name: string | null
  email: string | null
  avatarUrl: string | null
  role: string
  expertProfileId: string | null
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const exchangeToken = useCallback(async (supabaseToken: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/google`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ supabaseToken }),
        },
      )
      if (!res.ok) throw new Error('Auth exchange failed')
      const data = await res.json()
      localStorage.setItem('skilllink_token', data.accessToken)
      localStorage.setItem('skilllink_user', JSON.stringify(data.user))
      setToken(data.accessToken)
      setUser(data.user)
    } catch (err) {
      console.error('[Auth] Token exchange error:', err)
      // Never evict an existing valid session just because re-exchange failed
      // (e.g. backend temporarily unreachable on cold start)
      const existing = localStorage.getItem('skilllink_user')
      if (!existing) {
        setUser(null)
        setToken(null)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshUser = useCallback(async () => {
    const t = localStorage.getItem('skilllink_token')
    if (!t) return
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/me`, {
        headers: { Authorization: `Bearer ${t}` },
      })
      if (!res.ok) return
      const { data } = await res.json()
      const updated = {
        id: data.id,
        name: data.name,
        email: data.email,
        avatarUrl: data.avatarUrl,
        role: data.role,
        expertProfileId: data.expertProfile?.id ?? null,
      }
      localStorage.setItem('skilllink_user', JSON.stringify(updated))
      setUser(updated)
    } catch {}
  }, [])

  useEffect(() => {
    // Restore from localStorage on mount
    const savedToken = localStorage.getItem('skilllink_token')
    const savedUser = localStorage.getItem('skilllink_user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      setLoading(false)
    }

    // Listen for Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Only exchange if we don't already have a valid JWT
          // Avoids unnecessary re-exchange on every page load (INITIAL_SESSION)
          const existingJwt = localStorage.getItem('skilllink_token')
          if (!existingJwt) {
            await exchangeToken(session.access_token)
          } else {
            setLoading(false)
          }
        } else if (event === 'SIGNED_OUT') {
          // Only clear state if WE triggered sign-out (token already removed by signOut())
          if (!localStorage.getItem('skilllink_token')) {
            setUser(null)
            setToken(null)
          }
          setLoading(false)
        } else if (!session && !savedToken) {
          setLoading(false)
        }
      },
    )

    return () => subscription.unsubscribe()
  }, [exchangeToken])

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setToken(null)
    localStorage.removeItem('skilllink_token')
    localStorage.removeItem('skilllink_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, signInWithGoogle, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
