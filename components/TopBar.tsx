'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

type TopBarProps = {
  variant?: 'home' | 'back' | 'checkout'
  title?: string
  backHref?: string
}

export default function TopBar({ variant = 'home', title, backHref = '/' }: TopBarProps) {
  const { user } = useAuth()
  const resolvedTitle =
    title ?? (variant === 'checkout' ? 'Secure Checkout' : variant === 'back' ? 'SkillLink' : 'SkillLink')

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-background/95 backdrop-blur">
      <div className="app-shell flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {variant !== 'home' ? (
            <Link
              href={backHref}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-card transition hover:bg-slate-50"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-white shadow-card">
              SL
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-slate-900">{resolvedTitle}</p>
            <p className="text-xs text-slate-500">
              {variant === 'checkout' ? 'Protected by Razorpay' : 'Trusted local learning'}
            </p>
          </div>
        </div>

        <Link
          href={user ? '/profile' : '/login'}
          className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-card"
          aria-label={user ? 'Open profile' : 'Open login'}
        >
          {user?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt={user.name ?? 'Profile'} className="h-full w-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-slate-500">person</span>
          )}
        </Link>
      </div>
    </header>
  )
}
