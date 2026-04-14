'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  /** Optional sentence shown below the heading, e.g. "to book a session with Rohit Sharma" */
  context?: string
}

export default function LoginModal({ isOpen, onClose, context }: LoginModalProps) {
  const { signInWithGoogle } = useAuth()
  const [signingIn, setSigningIn] = useState(false)
  const [error, setError] = useState('')

  // Trap focus + close on Escape
  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    // Prevent body scroll while modal is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  async function handleGoogleSignIn() {
    setError('')
    setSigningIn(true)
    try {
      // Store the current URL so auth/callback can redirect back here after sign-in
      sessionStorage.setItem('skilllink_return_to', window.location.href)
      await signInWithGoogle()
      // signInWithGoogle redirects away — if we reach here something went wrong
    } catch (err) {
      setSigningIn(false)
      setError(
        err instanceof Error && err.message
          ? err.message
          : 'Unable to start sign in. Please try again.'
      )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Sign in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet — slides up from bottom on mobile, centered card on sm+ */}
      <div className="relative w-full max-w-md animate-slide-up rounded-t-[28px] bg-white px-6 pb-8 pt-5 shadow-2xl sm:rounded-[28px] sm:px-8 sm:pb-10 sm:pt-8">
        {/* Drag handle (mobile only) */}
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-slate-200 sm:hidden" aria-hidden="true" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
          aria-label="Close"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Logo mark */}
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-white shadow-sm">
          SL
        </div>

        {/* Heading */}
        <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">Sign in to continue</h2>
        {context ? (
          <p className="mt-1.5 text-sm leading-6 text-slate-500">{context}</p>
        ) : (
          <p className="mt-1.5 text-sm leading-6 text-slate-500">
            Join SkillLink to book sessions with verified local experts.
          </p>
        )}

        {/* Value props */}
        <ul className="mt-5 space-y-2">
          {[
            'Book in under 3 minutes',
            'Free cancellation up to 24 h before session',
            'Secure payments via Razorpay',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              {item}
            </li>
          ))}
        </ul>

        {/* Google button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={signingIn}
          className="mt-7 flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {signingIn ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
              Redirecting to Google…
            </>
          ) : (
            <>
              <GoogleIcon />
              Continue with Google
            </>
          )}
        </button>

        {error && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            {error}
          </div>
        )}

        <p className="mt-5 text-center text-xs leading-5 text-slate-400">
          By continuing, you agree to our{' '}
          <Link href="/terms-of-service" onClick={onClose} className="font-medium text-primary underline-offset-2 hover:underline">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy-policy" onClick={onClose} className="font-medium text-primary underline-offset-2 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}
