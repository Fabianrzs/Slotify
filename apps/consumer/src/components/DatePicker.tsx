'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const DAY_NAMES = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']

interface DatePickerProps {
  /** Dates returned by GET /api/availability/month (yyyy-MM-dd strings) */
  availableDates: string[]
  selectedDate: string | null
  onSelectDate: (date: string) => void
  isLoading?: boolean
  /** Called when the month changes so the parent can refetch available dates */
  onMonthChange?: (year: number, month: number) => void
}

export function DatePicker({
  availableDates,
  selectedDate,
  onSelectDate,
  isLoading = false,
  onMonthChange,
}: DatePickerProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth()) // 0-indexed

  const availableSet = new Set(availableDates)

  function prevMonth() {
    const newMonth = viewMonth === 0 ? 11 : viewMonth - 1
    const newYear = viewMonth === 0 ? viewYear - 1 : viewYear
    setViewMonth(newMonth)
    setViewYear(newYear)
    onMonthChange?.(newYear, newMonth + 1)
  }

  function nextMonth() {
    const newMonth = viewMonth === 11 ? 0 : viewMonth + 1
    const newYear = viewMonth === 11 ? viewYear + 1 : viewYear
    setViewMonth(newMonth)
    setViewYear(newYear)
    onMonthChange?.(newYear, newMonth + 1)
  }

  // Build calendar grid (Monday-first)
  const firstDay = new Date(viewYear, viewMonth, 1)
  // Monday = 0 offset, Sunday = 6
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null)

  function toDateString(day: number): string {
    const mm = String(viewMonth + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    return `${viewYear}-${mm}-${dd}`
  }

  function isBeforeToday(day: number): boolean {
    const d = new Date(viewYear, viewMonth, day)
    return d < today
  }

  const isPrevDisabled = viewYear < today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth <= today.getMonth())

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          disabled={isPrevDisabled}
          className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-semibold text-gray-900">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      {isLoading ? (
        <div className="grid grid-cols-7 gap-1">
          {Array(35).fill(null).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={i} />

            const dateStr = toDateString(day)
            const past = isBeforeToday(day)
            const available = availableSet.has(dateStr)
            const selected = selectedDate === dateStr

            return (
              <button
                key={i}
                disabled={past || !available}
                onClick={() => onSelectDate(dateStr)}
                className={cn(
                  'aspect-square rounded-lg text-sm font-medium transition-all flex items-center justify-center',
                  selected && 'bg-indigo-600 text-white shadow-sm',
                  !selected && available && !past && 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
                  !selected && (!available || past) && 'text-gray-300 cursor-not-allowed',
                )}
              >
                {day}
              </button>
            )
          })}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-indigo-50 border border-indigo-200" />
          Disponible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-gray-100" />
          Sin cupos
        </span>
      </div>
    </div>
  )
}
