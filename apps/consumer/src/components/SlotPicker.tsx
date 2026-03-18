'use client'

import { cn } from '@/lib/utils'
import type { AvailableSlot } from '@/modules/availability'

interface SlotPickerProps {
  slots: AvailableSlot[]
  selectedSlot: string | null
  onSelectSlot: (startAt: string) => void
  isLoading?: boolean
}

function formatTime(isoStr: string): string {
  return new Date(isoStr).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

export function SlotPicker({ slots, selectedSlot, onSelectSlot, isLoading = false }: SlotPickerProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {Array(8).fill(null).map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-6">
        No hay horarios disponibles para esta fecha.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map(slot => {
        const selected = selectedSlot === slot.startAt
        const full = !slot.isAvailable

        return (
          <button
            key={slot.startAt}
            disabled={full}
            onClick={() => onSelectSlot(slot.startAt)}
            title={full ? `Lleno (${slot.currentBookings}/${slot.maxCapacity})` : `${slot.remainingSpots} cupo${slot.remainingSpots !== 1 ? 's' : ''}`}
            className={cn(
              'flex flex-col items-center justify-center h-14 rounded-xl border text-sm font-medium transition-all',
              selected && 'bg-indigo-600 border-indigo-600 text-white shadow-sm',
              !selected && !full && 'border-gray-200 text-gray-700 hover:border-indigo-400 hover:bg-indigo-50',
              !selected && full && 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50',
            )}
          >
            <span>{formatTime(slot.startAt)}</span>
            {!full && !selected && slot.remainingSpots <= 3 && (
              <span className="text-[10px] text-orange-500 font-normal">
                {slot.remainingSpots} cupo{slot.remainingSpots !== 1 ? 's' : ''}
              </span>
            )}
            {full && <span className="text-[10px] text-gray-300 font-normal">Lleno</span>}
          </button>
        )
      })}
    </div>
  )
}
