'use client'

import { useEffect } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
}

export default function Toast({ message, type = 'info', onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  const styles = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-indigo-700',
  }

  const icons = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
  }

  return (
    <div className={`fixed top-4 left-4 right-4 max-w-md mx-auto z-[200] ${styles[type]} text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3`}>
      <span className="material-symbols-outlined text-xl flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
        {icons[type]}
      </span>
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} className="text-white/70 hover:text-white flex-shrink-0">
        <span className="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  )
}
