'use client'

import { useState } from 'react'
import { CalendarDays, XCircle, Loader2, Clock } from 'lucide-react'
import { useGetMyBookings, useCancelBooking, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '@/modules/bookings'
import type { Booking } from '@/modules/bookings'
import { formatDate, formatTime } from '@/lib/utils'

const GLOBAL_SLUG = '__user__'

export default function MisReservasPage() {
  const [page, setPage] = useState(1)
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; booking: Booking | null; reason: string }>({
    open: false,
    booking: null,
    reason: '',
  })

  const { data, isLoading } = useGetMyBookings(GLOBAL_SLUG, page)
  const cancelBooking = useCancelBooking(GLOBAL_SLUG)

  const bookings = data?.items ?? []
  const totalPages = data?.totalPages ?? 1

  function submitCancel() {
    if (!cancelDialog.booking || !cancelDialog.reason.trim()) return
    cancelBooking.mutate(
      { id: cancelDialog.booking.id, reason: cancelDialog.reason },
      { onSuccess: () => setCancelDialog({ open: false, booking: null, reason: '' }) },
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-xl mx-auto px-4 py-5">
          <h1 className="text-xl font-bold text-gray-900">Mis reservas</h1>
          <p className="text-sm text-slate-400 mt-0.5">Historial y próximas citas</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-indigo-400" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <CalendarDays size={36} className="mx-auto text-gray-200 mb-3" />
            <p className="font-semibold text-gray-400">Sin reservas</p>
            <p className="text-sm text-slate-400 mt-1">Aún no tienes reservas registradas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
                      <CalendarDays size={16} className="text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{booking.serviceName}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
                        <Clock size={11} />
                        <span className="capitalize">{formatDate(booking.startAt)}</span>
                        <span>·</span>
                        <span>{formatTime(booking.startAt)} – {formatTime(booking.endAt)}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${BOOKING_STATUS_COLORS[booking.status]}`}>
                    {BOOKING_STATUS_LABELS[booking.status]}
                  </span>
                </div>

                {(booking.status === 'Pending' || booking.status === 'Confirmed') && (
                  <div className="px-4 py-2.5 border-t border-gray-50">
                    <button
                      onClick={() => setCancelDialog({ open: true, booking, reason: '' })}
                      className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-500 transition-colors font-medium"
                    >
                      <XCircle size={13} />
                      Cancelar reserva
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 pt-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-white disabled:opacity-40 transition-colors"
            >
              Anterior
            </button>
            <span className="text-sm text-slate-400">{page} / {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-white disabled:opacity-40 transition-colors"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Cancel dialog */}
      {cancelDialog.open && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Cancelar reserva</h2>
              <p className="text-sm text-slate-400 mt-1">
                Esta acción no se puede deshacer.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Motivo</label>
              <textarea
                rows={3}
                value={cancelDialog.reason}
                onChange={e => setCancelDialog(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Cuéntanos el motivo..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-200 transition"
              />
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={() => setCancelDialog({ open: false, booking: null, reason: '' })}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Volver
              </button>
              <button
                disabled={!cancelDialog.reason.trim() || cancelBooking.isPending}
                onClick={submitCancel}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl disabled:opacity-50 transition-colors"
              >
                {cancelBooking.isPending ? 'Cancelando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
