'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavItem = { label: string; icon: string; href: string }

const learnerNav: NavItem[] = [
  { label: 'Discover', icon: 'explore', href: '/' },
  { label: 'Bookings', icon: 'event_note', href: '/bookings' },
  { label: 'Chat', icon: 'chat_bubble', href: '/chat' },
  { label: 'Profile', icon: 'person', href: '/profile' },
]

const expertNav: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
  { label: 'Bookings', icon: 'event_note', href: '/bookings' },
  { label: 'Chat', icon: 'chat_bubble', href: '/chat' },
  { label: 'Profile', icon: 'person', href: '/profile' },
]

export default function BottomNav({ mode = 'learner' }: { mode?: 'learner' | 'expert' }) {
  const pathname = usePathname()
  const items = mode === 'expert' ? expertNav : learnerNav

  return (
    <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 glass-nav shadow-bottom-nav rounded-t-3xl">
      {items.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-2xl transition-all ${
              isActive
                ? 'bg-indigo-50 text-indigo-700 scale-95'
                : 'text-zinc-500 hover:text-indigo-600'
            }`}
          >
            <span
              className={`material-symbols-outlined ${isActive ? 'icon-filled' : ''}`}
              style={isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : {}}
            >
              {item.icon}
            </span>
            <span className="text-[11px] font-medium tracking-wide mt-0.5">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
