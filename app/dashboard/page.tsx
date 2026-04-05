import Image from 'next/image'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import AvailabilityToggle from '@/components/AvailabilityToggle'

const sessions = [
  {
    name: 'Anjali Sharma',
    topic: 'React Advanced Hooks',
    date: 'Oct 24, 2023',
    time: '10:30 AM - 11:30 AM',
    status: 'UPI PAID',
    statusColor: 'bg-tertiary-container/10 text-tertiary-container',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUPPZr0pvoT4ifxpy_0cMqwB2FqsRcHimu0d4_hGImNEGu0cklQp26Mdr6dBdpDYCLfzlxkGNqjxQNHvbT1SdVPbkv84xTeQ39SqYlcLzuxwfR3S0UowEwGVJWmGR45ghMgmBEkQ7If2RzkTepWp6oKZaWUzmooMSoCpicpegW6Awz9xVnQYO9YcejOhT087euiNZZhPqDQa286ePOgV9SfdDaDUHftNBg9whJ2LCPAVDB4UDqZhVH7oRXqbSa9GIDmwBw0g4D7oc',
    online: true,
  },
  {
    name: 'Vikram Mehra',
    topic: 'System Design Basics',
    date: 'Oct 24, 2023',
    time: '02:00 PM - 03:00 PM',
    status: 'PENDING',
    statusColor: 'bg-secondary-container/10 text-secondary-container',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZQoHuzgd76ToTDmFLiQizL6xe_1vKAWIglyhZEvheqoMuEMBL7bcW7pGFcDxCnx9AeqcssfvwM1f-WiuQVGi1ULOduoiKSjKCcG9RNxf7mvxONiDkoxqK3k9QC80hga2x10AbY5EJPsdoRWiup20Mb9q6vQusf7_NQErDIXCcdKR6uoirqi8zW01I70mPy4gSs8_hcXv8nimIYqTPPW6lYQMy9mF4RmOZxO-HUqxbXntmPY6nusE81H_XWUhkbTXo62ravpGHCOQ',
    online: false,
  },
]


export default function ExpertDashboardPage() {
  return (
    <div className="text-on-surface bg-surface min-h-screen">

      {/* Top Bar */}
      <header className="fixed top-0 w-full flex justify-between items-center px-6 py-3 backdrop-blur-md bg-white/80 z-50">
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-primary hover:bg-zinc-100 p-2 rounded-full transition-colors">
            menu
          </button>
          <span className="text-2xl font-bold text-indigo-800 tracking-tight font-headline">SkillLink</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center bg-tertiary-container/10 px-3 py-1 rounded-full gap-2 border border-tertiary-container/20">
            <span className="material-symbols-outlined text-tertiary-container text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            <span className="text-[10px] font-bold tracking-wider text-tertiary-container uppercase">EXPERT MODE</span>
          </div>
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDquIRtGiyJDC-B85X0N_EJHJz8u9PLwPpkW-OjXlIrKw7ized8SqlqBhs1X0qpMxq2OSBDuw-H5usLo1oPQpTvmU3HmTItMLQg9Zpkc9uolnvsdrU5gtZ92b92pEi-m4ZyPYyhXxqoo5vI_NMmra92iiiwPTYQ2kkCWxqdByif7JJiT7qghWeJ8yX5iQj-aMjSeHEUJsZEcpcP59EXW2J7COO8Bizca5OwqqCfi6dsTpSjvdE1XiwocYMAeDzCCxFdwYnBwEHc14"
            alt="Rajesh"
            width={40}
            height={40}
            className="rounded-full object-cover ring-2 ring-primary/10"
          />
        </div>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">

        {/* Hero greeting + view toggle */}
        <section className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-[0.05em] text-zinc-500 font-semibold font-label">WELCOME BACK</span>
              <h1 className="text-4xl font-extrabold font-headline text-on-surface mt-1">Hello, Rajesh!</h1>
            </div>
            <div className="flex items-center gap-3 bg-surface-container-high p-1.5 rounded-xl">
              <button className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold shadow-sm">
                Expert View
              </button>
              <Link href="/" className="px-4 py-2 rounded-lg text-zinc-600 text-sm font-medium hover:bg-white transition-all">
                Learner View
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

          {/* Total Earnings */}
          <div className="bg-gradient-to-br from-primary to-primary-container p-6 rounded-[24px] text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-md">+12% vs last month</span>
              </div>
              <p className="text-primary-fixed/80 text-sm font-medium font-label uppercase tracking-wider">Total Earnings</p>
              <h2 className="text-3xl font-bold font-headline mt-1">₹12,500</h2>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-[120px]">trending_up</span>
            </div>
          </div>

          {/* Pending Bookings */}
          <div className="bg-surface-container-lowest p-6 rounded-[24px] hover:border-outline-variant/20 transition-all shadow-sm border border-transparent">
            <div className="flex justify-between items-start mb-8">
              <div className="bg-secondary-container/10 p-2 rounded-xl">
                <span className="material-symbols-outlined text-secondary">event_upcoming</span>
              </div>
              <span className="w-3 h-3 rounded-full bg-secondary animate-pulse block" />
            </div>
            <p className="text-zinc-500 text-sm font-medium font-label uppercase tracking-wider">Pending Bookings</p>
            <h2 className="text-3xl font-bold font-headline text-on-surface mt-1">4</h2>
            <p className="text-zinc-400 text-xs mt-2 italic">Next session in 2 hours</p>
          </div>

          {/* Avg Rating */}
          <div className="bg-surface-container-lowest p-6 rounded-[24px] hover:border-outline-variant/20 transition-all shadow-sm border border-transparent">
            <div className="flex justify-between items-start mb-8">
              <div className="bg-tertiary-container/10 p-2 rounded-xl">
                <span className="material-symbols-outlined text-tertiary-container"
                  style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
            </div>
            <p className="text-zinc-500 text-sm font-medium font-label uppercase tracking-wider">Avg Rating</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-3xl font-bold font-headline text-on-surface">4.9</h2>
              <span className="text-zinc-400 text-sm font-medium">/ 5.0</span>
            </div>
            <div className="flex gap-0.5 mt-2">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="material-symbols-outlined text-secondary-container text-xs"
                  style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Upcoming Sessions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold font-headline">Upcoming Sessions</h3>
              <button className="text-primary font-semibold text-sm hover:underline">View All</button>
            </div>

            <div className="space-y-4">
              {sessions.map((s) => (
                <div
                  key={s.name}
                  className="bg-surface-container-lowest p-5 rounded-[24px] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Image
                        src={s.img}
                        alt={s.name}
                        width={56}
                        height={56}
                        className="rounded-2xl object-cover"
                      />
                      {s.online && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-tertiary-container border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors font-headline">
                        {s.name}
                      </h4>
                      <p className="text-sm text-zinc-500">{s.topic}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-sm font-bold text-on-surface">{s.date}</p>
                      <p className="text-xs text-zinc-500">{s.time}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${s.statusColor}`}>
                        {s.status}
                      </span>
                      <button className="mt-2 material-symbols-outlined text-zinc-400 hover:text-primary transition-colors">
                        more_vert
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Availability Sidebar */}
          <div className="space-y-6">
            <div className="bg-surface-container p-6 rounded-[32px]">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary">bolt</span>
                <h3 className="text-lg font-bold font-headline">Quick Availability</h3>
              </div>
              <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
                Toggle your slots for{' '}
                <span className="font-bold text-on-surface">Today, Oct 24</span>. Active slots are visible to
                learners for instant booking.
              </p>

              <AvailabilityToggle />
            </div>
          </div>

        </div>
      </main>

      <BottomNav mode="expert" />

      {/* Mobile FAB */}
      <div className="fixed bottom-24 right-6 md:hidden">
        <button className="w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform">
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      </div>
    </div>
  )
}
