import Image from 'next/image'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'

const bookings = [
  {
    id: '1',
    expert: 'Rajesh M.',
    skill: 'Badminton Coaching',
    date: 'Sat, 21 Oct',
    time: '07:00 AM',
    status: 'CONFIRMED',
    statusColor: 'bg-tertiary-container/10 text-tertiary-container',
    price: '₹500',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-60xaMKCvV7WDEQvdRQOumfLUNfPKOcPD6IHYwQnXEO4I7cvdIyYhePJzRRxUJO95RDhwY6pGIA7JHHmfOk-4PzSQrJDl-F1mMy9to2xZXbCKymFkBsdymjMt6bWm1OT-_1FV7sgOgFh4fAFqWo4XIEdpq8Q1MbW9SLs6LhY6tVwr7m_0z68wgOAwPZ91YOx473Qf6I-iNk2OftdAsRYJQhenNYsQ0GaSmJb_zldcOjSDshzx5NpVzbTQiCYp0vI2orbPKmNt7cE',
  },
  {
    id: '2',
    expert: 'Priya Sharma',
    skill: 'Yoga & Wellness',
    date: 'Mon, 23 Oct',
    time: '06:30 AM',
    status: 'PENDING',
    statusColor: 'bg-secondary-container/10 text-secondary-container',
    price: '₹1,200',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBENaonpTGDLeR8y30HBgV2D04I4q4vXIrGprMF6qhP5gxrCGWylBs4xO5BeRbSdGqTgWS8q33aw2pn0u8uTFC8BjbqwbpzyZKaluvqBfLLKwPF7JgTz3xOJV7sW26Pvm8KWJjUnkPXnbBQ1RihCOo0OLM5F3gS7axFmlNO5R60OpeIyMcCgZGU81_3xnwr-B11KzCe4gjyX76AEMlTTi6pMTWsiGDiuNI6pUiFl7jsdF-jIkL-2SVE1HBpyMasp0GdBz6JeFRatqs',
  },
  {
    id: '3',
    expert: 'Vikram Roy',
    skill: 'Pro Badminton',
    date: 'Wed, 18 Oct',
    time: '05:00 PM',
    status: 'COMPLETED',
    statusColor: 'bg-surface-container-high text-zinc-500',
    price: '₹850',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcKwWMMbh89ChsaS4JHHypKe5vH9pi_X5iUWuCrbUm1MhTWwdKIJ7tjHcURVP3a28EQbWtQhhvGDubX9HgmHo1BSch0RQraNchbcY9uDCxJ_KGBfn6aw6A1jJRoG-Mobb1TyhauO7Tky670BptXO1sXfPTYLC6tuluyU5OZxi5jRrW7Ah3sbvvWtHxFe86Ct8-F8T7V1C0FyF35AJitiCRdTOtdti4Y6-VWpFOcYRP0KYI0_Ti4hRS3LBiOOl3o6KOSKYNk-aFbJw',
  },
]

const tabs = ['All', 'Upcoming', 'Completed']

export default function BookingsPage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen pb-28">

      {/* Top Bar */}
      <header className="fixed top-0 w-full flex justify-between items-center px-6 py-3 glass-nav z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-zinc-100 transition-colors rounded-full">
            <span className="material-symbols-outlined text-indigo-700">arrow_back</span>
          </Link>
          <span className="text-2xl font-bold text-indigo-800 tracking-tight font-headline">My Bookings</span>
        </div>
        <button className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
          <span className="material-symbols-outlined text-zinc-500">tune</span>
        </button>
      </header>

      <main className="pt-20 px-6 max-w-2xl mx-auto">

        {/* Tab Filter */}
        <div className="flex gap-3 mt-6 mb-8">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              className={`px-5 py-2 rounded-2xl text-sm font-semibold transition-colors ${
                i === 0
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-container-low text-zinc-500 hover:bg-indigo-50 hover:text-indigo-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Booking Cards */}
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-surface-container-lowest rounded-[24px] p-5 shadow-editorial hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-14 h-14 flex-shrink-0">
                  <Image
                    src={b.img}
                    alt={b.expert}
                    fill
                    className="object-cover rounded-2xl"
                  />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-on-surface font-headline">{b.expert}</h3>
                      <p className="text-sm text-zinc-500">{b.skill}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${b.statusColor}`}>
                      {b.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Date / Time / Price row */}
              <div className="flex items-center justify-between pt-4 border-t border-surface-container-high">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                    <span className="text-xs font-medium">{b.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    <span className="text-xs font-medium">{b.time}</span>
                  </div>
                </div>
                <span className="text-base font-extrabold text-on-surface font-headline">{b.price}</span>
              </div>

              {/* Actions */}
              {b.status === 'CONFIRMED' && (
                <div className="flex gap-3 mt-4">
                  <button className="flex-1 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-colors">
                    View Details
                  </button>
                  <button className="flex-1 py-2.5 bg-surface-container-low text-zinc-500 rounded-xl text-sm font-semibold hover:bg-zinc-200 transition-colors">
                    Cancel
                  </button>
                </div>
              )}
              {b.status === 'COMPLETED' && (
                <div className="flex gap-3 mt-4">
                  <button className="flex-1 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-colors">
                    Leave a Review
                  </button>
                  <Link
                    href="/"
                    className="flex-1 py-2.5 bg-surface-container-low text-zinc-500 rounded-xl text-sm font-semibold hover:bg-zinc-200 transition-colors text-center"
                  >
                    Book Again
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty state hint */}
        <div className="mt-12 text-center">
          <p className="text-zinc-400 text-sm">Looking for a new skill?</p>
          <Link href="/" className="text-primary font-semibold text-sm hover:underline">
            Discover experts →
          </Link>
        </div>

      </main>

      <BottomNav mode="learner" />
    </div>
  )
}
