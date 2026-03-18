'use client'

import { useState } from 'react'
import { CalendarDays, XCircle, Loader2 } from 'lucide-react'
import { useGetMyBookings, useCancelBooking, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '@/modules/bookings'
import type { Booking } from '@/modules/bookings'
import { formatDate, formatTime } from '@/lib/utils'

// For "Mis reservas" we don't have a single slug context.
// The bookings endpoint uses the tenant context from X-Tenant-Slug resolved per booking.
// We query without slug — the API returns bookings for the authenticated user across tenants.
// We use a generic slug placeholder; the server resolves by auth token's clientId.
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis reservas</h1>
          <p className="text-sm text-gray-500 mt-1">Historial y próximas citas</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={32} className="animate-spin text-indigo-400" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <CalendarDays size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">Sin reservas</p>
            <p className="text-sm mt-1">Aún no tienes reservas registradas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{booking.serviceName}</p>
                    <p className="text-xs text-gray-500 mt-0.5 capitalize">{formatDate(booking.startAt)}</p>
                    <p className="text-xs text-gray-500">{formatTime(booking.startAt)} – {formatTime(booking.endAt)}</p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${BOOKING_STATUS_COLORS[booking.status]}`}>
                    {BOOKING_STATUS_LABELS[booking.status]}
                  </span>
                </div>

                {(booking.status === 'Pending' || booking.status === 'Confirmed') && (
                  <button
                    onClick={() => setCancelDialog({ open: true, booking, reason: '' })}
                    className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors"
                  >
                    <XCircle size={13} />
                    Cancelar reserva
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-xl disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="px-4 py-2 text-sm text-gray-500">{page} / {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 text-sm border border-gray-200 rounded-xl disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Cancel dialog */}
      {cancelDialog.open && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Cancelar reserva</h2>
            <p className="text-sm text-gray-500">
              ¿Estás seguro? Esta acción no se puede deshacer.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
              <textarea
                rows={2}
                value={cancelDialog.reason}
                onChange={e => setCancelDialog(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Cuéntanos el motivo..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelDialog({ open: false, booking: null, reason: '' })}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                Volver
              </button>
              <button
                disabled={!cancelDialog.reason.trim() || cancelBooking.isPending}
                onClick={submitCancel}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl disabled:opacity-50"
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
