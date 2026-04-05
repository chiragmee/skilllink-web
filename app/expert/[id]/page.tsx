import Image from 'next/image'
import Link from 'next/link'
import TopBar from '@/components/TopBar'

const days = [
  { day: 'Mon', date: '12', active: true },
  { day: 'Tue', date: '13' },
  { day: 'Wed', date: '14' },
  { day: 'Thu', date: '15' },
  { day: 'Fri', date: '16' },
  { day: 'Sat', date: '17' },
]

const morningSlots = ['07:00 AM', '08:30 AM', '10:00 AM']
const eveningSlots = ['05:00 PM', '06:30 PM', '08:00 PM']
const bookedSlots = new Set(['06:30 PM'])

const skills = ['Badminton Professional', 'Fitness Training', 'Sports Nutrition', 'Footwork Drills']

export default function ExpertProfilePage() {
  return (
    <div className="bg-surface text-on-surface mb-32 min-h-screen">
      <TopBar variant="back" backHref="/" />

      <main className="pt-20 px-6 max-w-2xl mx-auto">

        {/* Hero with Overlapping Card — Editorial Asymmetry */}
        <section className="relative mb-12">
          <div className="w-full h-80 rounded-3xl overflow-hidden shadow-sm relative">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-60xaMKCvV7WDEQvdRQOumfLUNfPKOcPD6IHYwQnXEO4I7cvdIyYhePJzRRxUJO95RDhwY6pGIA7JHHmfOk-4PzSQrJDl-F1mMy9to2xZXbCKymFkBsdymjMt6bWm1OT-_1FV7sgOgFh4fAFqWo4XIEdpq8Q1MbW9SLs6LhY6tVwr7m_0z68wgOAwPZ91YOx473Qf6I-iNk2OftdAsRYJQhenNYsQ0GaSmJb_zldcOjSDshzx5NpVzbTQiCYp0vI2orbPKmNt7cE"
              alt="Rajesh M."
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Overlapping profile card */}
          <div className="absolute -bottom-10 left-6 right-6 bg-surface-container-lowest p-6 rounded-3xl shadow-editorial">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-extrabold text-on-surface tracking-tight font-headline">Rajesh M.</h2>
                  <div className="bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    <span className="text-[10px] font-bold tracking-wider uppercase">VERIFIED</span>
                  </div>
                </div>
                <p className="text-indigo-700 font-semibold mb-2">Professional Badminton Coach</p>
                <div className="flex items-center gap-1 bg-surface-container-low w-fit px-2 py-1 rounded-lg">
                  <span className="material-symbols-outlined text-secondary text-sm"
                    style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="text-sm font-bold">4.9/5</span>
                  <span className="text-xs text-zinc-500 ml-1">(124 Reviews)</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.1em] mb-1">EXPERIENCE</p>
                <p className="text-xl font-bold text-indigo-800 font-headline">12+ Years</p>
              </div>
            </div>
          </div>
        </section>

        {/* Bio & Skills */}
        <section className="mt-16 space-y-8">
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-on-surface font-headline">About the Coach</h3>
            <p className="text-zinc-600 leading-relaxed">
              National-level badminton player turned coach. I specialize in helping intermediate players master their
              footwork and aggressive smash techniques. My training philosophy focuses on explosive movement and mental
              resilience on court.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-on-surface font-headline">Core Skills</h3>
            <div className="flex flex-wrap gap-3">
              {skills.map((s) => (
                <span key={s} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-2xl text-sm font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="mt-12 space-y-4">
          <h3 className="text-lg font-bold text-on-surface font-headline">Pricing Plans</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Hourly */}
            <div className="bg-surface-container-low p-5 rounded-3xl border-2 border-transparent hover:border-indigo-200 transition-all cursor-pointer group">
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-indigo-700">timer</span>
              </div>
              <p className="text-sm font-semibold text-zinc-500 mb-1">Hourly</p>
              <p className="text-2xl font-extrabold text-on-surface font-headline">₹500</p>
              <p className="text-xs text-zinc-400 mt-2">Single session focus</p>
            </div>

            {/* Package — Popular */}
            <div className="bg-primary-container p-5 rounded-3xl border-2 border-primary transition-all cursor-pointer shadow-lg shadow-indigo-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-secondary-container text-on-secondary-container text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                POPULAR
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-white">layers</span>
              </div>
              <p className="text-sm font-semibold text-indigo-100 mb-1">Package</p>
              <p className="text-2xl font-extrabold text-white font-headline">₹2200</p>
              <p className="text-xs text-indigo-200 mt-2">5 sessions (Save ₹300)</p>
            </div>
          </div>
        </section>

        {/* Availability */}
        <section className="mt-12 mb-8 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-on-surface font-headline">Availability</h3>
            <button className="text-primary text-sm font-bold flex items-center gap-1">
              October 2023{' '}
              <span className="material-symbols-outlined text-sm">calendar_month</span>
            </button>
          </div>

          {/* Date Picker */}
          <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
            {days.map((d) => (
              <button
                key={d.date}
                className={`flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center transition-colors ${
                  d.active
                    ? 'bg-indigo-700 text-white shadow-md'
                    : 'bg-surface-container-low text-on-surface hover:bg-zinc-200'
                }`}
              >
                <span className={`text-xs font-medium uppercase ${d.active ? 'opacity-80' : 'text-zinc-400'}`}>
                  {d.day}
                </span>
                <span className="text-xl font-bold">{d.date}</span>
              </button>
            ))}
          </div>

          <div className="space-y-6 mt-6">
            {/* Morning */}
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">wb_sunny</span> Morning Slots
              </p>
              <div className="grid grid-cols-3 gap-3">
                {morningSlots.map((slot, i) => (
                  <button
                    key={slot}
                    className={`py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                      i === 1
                        ? 'bg-indigo-50 text-indigo-700 border-2 border-indigo-200 font-bold'
                        : 'bg-surface-container-low border-transparent hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-100'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Evening */}
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">dark_mode</span> Evening Slots
              </p>
              <div className="grid grid-cols-3 gap-3">
                {eveningSlots.map((slot) => {
                  const booked = bookedSlots.has(slot)
                  return (
                    <button
                      key={slot}
                      disabled={booked}
                      className={`py-2.5 rounded-xl text-sm transition-all border ${
                        booked
                          ? 'bg-zinc-100 text-zinc-400 line-through cursor-not-allowed border-transparent'
                          : 'bg-surface-container-low font-semibold border-transparent hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-100'
                      }`}
                    >
                      {slot}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Sticky Booking Bar */}
      <div className="fixed bottom-0 left-0 w-full z-50 px-6 pb-8 pt-4 bg-white/80 backdrop-blur-xl border-t border-zinc-100">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-6">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">Total Price</span>
            <span className="text-xl font-extrabold text-on-surface font-headline">
              ₹500 <span className="text-xs font-normal text-zinc-500">/ session</span>
            </span>
          </div>
          <Link
            href="/booking/confirm"
            className="flex-1 bg-gradient-to-r from-secondary to-on-secondary-fixed-variant text-white py-4 px-6 rounded-2xl font-bold shadow-lg shadow-orange-100 flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            Proceed to Book
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
