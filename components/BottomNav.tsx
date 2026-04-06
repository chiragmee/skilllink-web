'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavItem = {
  label: string
  icon: string
  href: string
}

const learnerItems: NavItem[] = [
  { label: 'Discover', icon: 'travel_explore', href: '/' },
  { label: 'Bookings', icon: 'calendar_month', href: '/bookings' },
  { label: 'Profile', icon: 'person', href: '/profile' },
]

const expertItems: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
  { label: 'Bookings', icon: 'calendar_month', href: '/bookings' },
  { label: 'Profile', icon: 'person', href: '/profile' },
]

export default function BottomNav({ mode = 'learner' }: { mode?: 'learner' | 'expert' }) {
  const pathname = usePathname()
  const items = mode === 'expert' ? expertItems : learnerItems

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-2 shadow-nav backdrop-blur">
      <div className="app-shell flex items-center justify-around px-4">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-[88px] flex-col items-center justify-center rounded-2xl px-3 py-2 text-xs font-medium transition ${
                active ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              <span className="mt-1">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
