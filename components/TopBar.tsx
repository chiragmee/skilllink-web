import Link from 'next/link'
import Image from 'next/image'

type TopBarProps = {
  variant?: 'home' | 'back' | 'checkout'
  title?: string
  backHref?: string
}

export default function TopBar({ variant = 'home', backHref = '/' }: TopBarProps) {
  if (variant === 'home') {
    return (
      <header className="fixed top-0 w-full flex justify-between items-center px-6 py-3 glass-nav z-50">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-zinc-100 transition-colors rounded-full">
            <span className="material-symbols-outlined text-indigo-700">menu</span>
          </button>
          <span className="text-2xl font-bold text-indigo-800 tracking-tight font-headline">SkillLink</span>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-100">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1euOOu7515_Z1ENdmtF-MuRqcyOTSyhP6j5C3sJF5qtPncE2iyKj_IurdMs9e9oOWGnbb5aB1XMXXg81Cc2OL8qVN18AaNLOepLwYOaHyBUWqIO5ndaTbkz3N4oAPUllhWFLuTW8a3X1FgH1jZdcNZHS9_Reue6u9gXHPfSXJWwEKBSMj8g3SJ3uVWjnB5dAjOnqYQC7PKpW-ur-5jczd191UrygGAgcc28ICamt1IF7olb7njPn1A12j12vlthdS7Ji-rZ5Xw7A"
            alt="User"
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        </div>
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
