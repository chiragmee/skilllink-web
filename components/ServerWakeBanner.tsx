'use client'

import { useEffect, useState } from 'react'
import { checkBackendHealth } from '@/lib/api'

export default function ServerWakeBanner() {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (dismissed) return
    let cancelled = false
    let interval: ReturnType<typeof setInterval>

    const timer = setTimeout(async () => {
      if (cancelled) return
      const healthy = await checkBackendHealth()
      if (!healthy && !cancelled) {
        setShow(true)
        interval = setInterval(async () => {
          if (cancelled) { clearInterval(interval); return }
          const ok = await checkBackendHealth()
          if (ok) { setShow(false); clearInterval(interval) }
        }, 5000)
      }
    }, 4000)

    return () => {
      cancelled = true
      clearTimeout(timer)
      if (interval) clearInterval(interval)
    }
  }, [dismissed])

  if (!show || dismissed) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between gap-3 bg-indigo-700 text-white text-sm py-2.5 px-4 shadow-lg">
      <div className="flex items-center gap-3">
        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin flex-shrink-0" />
        <span>Waking up the server… this takes about 30 seconds on first visit.</span>
      </div>
      <button onClick={() => setDismissed(true)} className="text-white/60 hover:text-white flex-shrink-0 ml-2">
        <span className="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  )
}
