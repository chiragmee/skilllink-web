'use client'

import { useEffect } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
}

const toneStyles = {
  success: 'border-green-200 bg-green-50 text-green-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-indigo-200 bg-indigo-50 text-indigo-800',
} as const

const toneIcons = {
  success: 'check_circle',
  error: 'error',
  info: 'info',
} as const

export default function Toast({ message, type = 'info', onClose }: ToastProps) {
  useEffect(() => {
    const timeout = window.setTimeout(onClose, 4000)
    return () => window.clearTimeout(timeout)
  }, [onClose])

  return (
    <div className="fixed inset-x-0 top-4 z-[100] px-4">
      <div
        className={`mx-auto flex w-full max-w-md items-start gap-3 rounded-2xl border px-4 py-3 shadow-card ${toneStyles[type]}`}
        role="status"
        aria-live="polite"
      >
        <span className="material-symbols-outlined text-[20px]">{toneIcons[type]}</span>
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button onClick={onClose} className="text-current/70 transition hover:text-current" aria-label="Dismiss notification">
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  )
}
