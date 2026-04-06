'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

type TopBarProps = {
  variant?: 'home' | 'back' | 'checkout'
  title?: string
  backHref?: string
}

export default function TopBar({ variant = 'home', backHref = '/' }: TopBarProps) {
  const { user } = useAuth()
  const router = useRouter()

  if (variant === 'home') {
    return (
      <header className="fixed top-0 w-full flex justify-between items-center px-6 py-3 glass-nav z-50">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold text-indigo-800 tracking-tight font-headline">SkillLink</span>
        </div>
        <Link href={user ? '/profile' : '/login'}
          className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-100 bg-indigo-50 flex items-center justify-center">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name||''} className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-indigo-400 text-xl">person</span>
          )}
        </Link>
      </header>
    )
  }

  if (variant === 'checkout') {
    return (
      <nav className="fixed top-0 w-full flex justify-between items-center px-6 py-3 glass-nav z-50">
        <div className="flex items-center gap-4">
          <Link href={backHref} className="p-2 hover:bg-zinc-100 transition-colors rounded-full active:scale-95">
            <span className="material-symbols-outlined text-indigo-700">arrow_back</span>
          </Link>
          <span className="text-2xl font-bold text-indigo-800 tracking-tight font-headline">SkillLink</span>
        </div>
        <span className="text-[11px] font-medium tracking-widest uppercase text-indigo-700 px-3 py-1 bg-indigo-50 rounded-full">
          Secure Checkout
        </span>
      </nav>
    )
  }

  return (
    <header className="fixed top-0 w-full flex justify-between items-center px-6 py-3 glass-nav z-50">
      <div className="flex items-center gap-4">
        <Link href={backHref} className="p-2 hover:bg-zinc-100 transition-colors rounded-full">
          <span className="material-symbols-outlined text-indigo-700">arrow_back</span>
        </Link>
        <span className="text-2xl font-bold text-indigo-800 tracking-tight font-headline">SkillLink</span>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
          <span className="material-symbols-outlined text-zinc-500">share</span>
        </button>
        <button className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
          <span className="material-symbols-outlined text-zinc-500">favorite</span>
        </button>
      </div>
    </header>
  )
}
