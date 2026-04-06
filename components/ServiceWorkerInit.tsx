'use client'

import { useEffect } from 'react'

export default function ServiceWorkerInit() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    async function cleanupServiceWorkers() {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(registrations.map((registration) => registration.unregister()))
      } catch (err) {
        console.warn('[SW] Unregister failed:', err)
      }

      if ('caches' in window) {
        try {
          const cacheKeys = await caches.keys()
          await Promise.all(cacheKeys.map((key) => caches.delete(key)))
        } catch (err) {
          console.warn('[SW] Cache cleanup failed:', err)
        }
      }
    }

    cleanupServiceWorkers()
  }, [])

  return null
}
