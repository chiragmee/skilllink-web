import Image from 'next/image'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'

const menuItems = [
  { icon: 'swap_horiz', label: 'Switch to Expert Mode', href: '/dashboard' },
  { icon: 'event_note', label: 'My Bookings', href: '/bookings' },
  { icon: 'payments', label: 'Payment History', href: '#' },
  { icon: 'bookmark', label: 'Saved Experts', href: '#' },
  { icon: 'help_outline', label: 'Help Center', href: '#' },
  { icon: 'settings', label: 'Settings', href: '#' },
]

export default function ProfilePage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen pb-28">
      <header className="fixed top-0 w-full flex justify-between items-center px-6 py-3 glass-nav z-50">
        <span className="text-2xl font-bold text-indigo-800 tracking-tight font-headline">Profile</span>
        <button className="p-2 hover:bg-zinc-100 rounded-full">
          <span className="material-symbols-outlined text-zinc-500">settings</span>
        </button>
      </header>

      <main className="pt-20 px-6 max-w-2xl mx-auto">
        {/* Profile Card */}
        <div className="bg-surface-container-lowest rounded-[24px] p-6 shadow-editorial mb-8 flex items-center gap-5 mt-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-indigo-100 flex-shrink-0">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1euOOu7515_Z1ENdmtF-MuRqcyOTSyhP6j5C3sJF5qtPncE2iyKj_IurdMs9e9oOWGnbb5aB1XMXXg81Cc2OL8qVN18AaNLOepLwYOaHyBUWqIO5ndaTbkz3N4oAPUllhWFLuTW8a3X1FgH1jZdcNZHS9_Reue6u9gXHPfSXJWwEKBSMj8g3SJ3uVWjnB5dAjOnqYQC7PKpW-ur-5jczd191UrygGAgcc28ICamt1IF7olb7njPn1A12j12vlthdS7Ji-rZ5Xw7A"
              alt="Profile"
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold font-headline text-on-surface">Aravind Kumar</h2>
            <p className="text-sm text-zinc-500">Learner & Enthusiast</p>
            <p className="text-xs text-indigo-700 font-medium mt-1">+91 98765 43210</p>
          </div>
        </div>

        {/* Menu */}
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-2xl hover:bg-indigo-50 transition-colors group"
            >
              <div className="w-10 h-10 bg-surface-container-low rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                <span className="material-symbols-outlined text-zinc-500 group-hover:text-indigo-700">{item.icon}</span>
              </div>
              <span className="font-medium text-on-surface group-hover:text-indigo-700 transition-colors">{item.label}</span>
              <span className="material-symbols-outlined text-zinc-300 ml-auto">chevron_right</span>
            </Link>
          ))}
        </nav>

        <button className="w-full mt-8 py-4 bg-error/10 text-error rounded-2xl font-semibold text-sm">
          Log Out
        </button>
      </main>

      <BottomNav mode="learner" />
    </div>
  )
}
