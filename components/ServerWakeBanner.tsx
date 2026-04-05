'use client'

import { useEffect, useState } from 'react'
import { checkBackendHealth } from '@/lib/api'

/**
 * Shows a non-blocking banner when the Render backend is cold-starting.
 * Disappears automatically once the server responds healthy.
 */
export default function ServerWakeBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    let cancelled = false
    // Wait 4 seconds — if backend isn't healthy by then, show the banner
    const timer = setTimeout(async () => {
      if (cancelled) return
      const healthy = await checkBackendHealth()
      if (!healthy && !cancelled) {
        setShow(true)
        // Poll until healthy, then hide
        const interval = setInterval(async () => {
          const ok = await checkBackendHealth()
          if (ok) {
            setShow(false)
            clearInterval(interval)
          }
        }, 5000)
      }
    }, 4000)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [])

  if (!show) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-3 bg-indigo-700 text-white text-sm py-2 px-4 shadow-lg">
      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin flex-shrink-0" />
      <span>Connecting to server… First visit may take up to 30 seconds.</span>
    </div>
  )
}
