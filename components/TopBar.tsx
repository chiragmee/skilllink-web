'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

type TopBarProps = {
  variant?: 'home' | 'back' | 'checkout'
  title?: string
  backHref?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  onSearchSubmit?: () => void
  searchPlaceholder?: string
}

export default function TopBar({
  variant = 'home',
  title,
  backHref = '/',
  searchValue,
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder = 'Search skills or experts',
}: TopBarProps) {
  const { user } = useAuth()
  const showSearch = variant === 'home' && typeof searchValue === 'string' && !!onSearchChange && !!onSearchSubmit
  const resolvedTitle =
    title ?? (variant === 'checkout' ? 'Secure Checkout' : variant === 'back' ? 'SkillLink' : 'SkillLink')

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-background/95 backdrop-blur">
      <div className="app-shell px-4 pb-3 pt-3 sm:px-6">
        <div className="flex h-12 items-center justify-between">
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

        {showSearch && (
          <form
            onSubmit={(event) => {
              event.preventDefault()
              onSearchSubmit()
            }}
            className="mt-3"
          >
            <div className="relative">
              <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                search
              </span>
              <input
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-20 text-sm text-slate-900 outline-none ring-primary/20 transition focus:ring-2"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 h-8 rounded-xl bg-primary px-3 text-xs font-semibold text-white"
              >
                Search
              </button>
            </div>
          </form>
        )}
      </div>
    </header>
  )
}
