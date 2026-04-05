import Link from 'next/link'
import BottomNav from '@/components/BottomNav'

export default function ChatPage() {
  return (
    <div className="bg-surface text-on-surface min-h-screen pb-28">
      <header className="fixed top-0 w-full flex justify-between items-center px-6 py-3 glass-nav z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-zinc-100 rounded-full">
            <span className="material-symbols-outlined text-indigo-700">arrow_back</span>
          </Link>
          <span className="text-2xl font-bold text-indigo-800 tracking-tight font-headline">Messages</span>
        </div>
      </header>

      <main className="pt-20 px-6 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[70vh]">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-3xl text-indigo-700">chat_bubble</span>
        </div>
        <h2 className="text-xl font-bold font-headline text-on-surface mb-2">No messages yet</h2>
        <p className="text-zinc-500 text-sm text-center mb-6">Chat with your experts after booking a session.</p>
        <Link href="/" className="px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm">
          Find an Expert
        </Link>
      </main>

      <BottomNav mode="learner" />
    </div>
  )
}
