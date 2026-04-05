'use client'

import { useState } from 'react'

type Slot = { time: string; active: boolean }

const initialSlots: Slot[] = [
  { time: '09:00 AM - 10:00 AM', active: false },
  { time: '11:30 AM - 12:30 PM', active: true },
  { time: '04:00 PM - 05:00 PM', active: true },
  { time: '06:30 PM - 07:30 PM', active: false },
]

export default function AvailabilityToggle() {
  const [slots, setSlots] = useState<Slot[]>(initialSlots)

  const toggle = (index: number) => {
    setSlots((prev) =>
      prev.map((s, i) => (i === index ? { ...s, active: !s.active } : s))
    )
  }

  return (
    <div className="space-y-3">
      {slots.map((slot, i) => (
        <div
          key={slot.time}
          className={`flex items-center justify-between p-4 bg-white rounded-2xl transition-all ${
            slot.active ? 'ring-2 ring-indigo-200' : ''
          }`}
        >
          <span className={`text-sm font-semibold ${slot.active ? 'text-indigo-700' : 'text-zinc-700'}`}>
            {slot.time}
          </span>
          <button
            onClick={() => toggle(i)}
            role="switch"
            aria-checked={slot.active}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
              slot.active ? 'bg-indigo-700' : 'bg-zinc-200'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                slot.active ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      ))}
      <button className="w-full mt-3 py-4 bg-white border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-400 text-sm font-bold hover:border-indigo-700 hover:text-indigo-700 transition-all flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-lg">add_circle</span>
        Add Custom Slot
      </button>
    </div>
  )
}
