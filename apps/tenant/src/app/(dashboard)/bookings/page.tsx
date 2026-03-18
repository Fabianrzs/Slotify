'use client'

import { useState } from 'react'
import { CalendarDays, Search, ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertCircle, Check } from 'lucide-react'
import {
  useGetBookings,
  useCancelBooking,
  useUpdateBookingStatus,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_COLORS,
  formatBookingTime,
  formatBookingDate,
  canCancelBooking,
} from '@/modules/bookings'
import type { Booking, BookingStatus, BookingFilters } from '@/modules/bookings'
import { useGetBranches } from '@/modules/branches'

const STATUS_OPTIONS: { value: BookingStatus | ''; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'Pending', label: 'Pendiente' },
  { value: 'Confirmed', label: 'Confirmada' },
  { value: 'Completed', label: 'Completada' },
  { value: 'Cancelled', label: 'Cancelada' },
  { value: 'NoShow', label: 'No se presentó' },
]

export default function BookingsPage() {
  const [filters, setFilters] = useState<BookingFilters>({ page: 1, pageSize: 20 })
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; bookingId: string; reason: string }>({
    open: false,
    bookingId: '',
    reason: '',
  })

  const { data, isLoading } = useGetBookings(filters)
  const { data: branches = [] } = useGetBranches()
  const cancelBooking = useCancelBooking()
  const updateStatus = useUpdateBookingStatus()

  const bookings = data?.items ?? []
  const totalPages = data?.totalPages ?? 1

  function setFilter<K extends keyof BookingFilters>(key: K, value: BookingFilters[K]) {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  function handleConfirm(booking: Booking) {
    updateStatus.mutate({ id: booking.id, status: 'Confirmed' })
  }

  function handleComplete(booking: Booking) {
    updateStatus.mutate({ id: booking.id, status: 'Completed' })
  }

  function handleNoShow(booking: Booking) {
    updateStatus.mutate({ id: booking.id, status: 'NoShow' })
  }

  function openCancel(booking: Booking) {
    setCancelDialog({ open: true, bookingId: booking.id, reason: '' })
  }

  function submitCancel() {
    if (!cancelDialog.reason.trim()) return
    cancelBooking.mutate(
      { id: cancelDialog.bookingId, reason: cancelDialog.reason },
      { onSuccess: () => setCancelDialog({ open: false, bookingId: '', reason: '' }) },
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>
        <p className="text-gray-500 mt-1 text-sm">Gestiona las reservas de tu negocio</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-wrap gap-3 items-end">
        {/* Branch */}
        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="text-xs font-medium text-gray-500">Sede</label>
          <select
            value={filters.branchId ?? ''}
            onChange={e => setFilter('branchId', e.target.value || undefined)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="">Todas las sedes</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1 min-w-[160px]">
          <label className="text-xs font-medium text-gray-500">Estado</label>
          <select
            value={filters.status ?? ''}
            onChange={e => setFilter('status', (e.target.value as BookingStatus) || undefined)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Date from */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Desde</label>
          <input
            type="date"
            value={filters.dateFrom ?? ''}
            onChange={e => setFilter('dateFrom', e.target.value || undefined)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        {/* Date to */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Hasta</label>
          <input
            type="date"
            value={filters.dateTo ?? ''}
            onChange={e => setFilter('dateTo', e.target.value || undefined)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        {/* Search */}
        <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
          <label className="text-xs font-medium text-gray-500">Buscar cliente</label>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Nombre o email..."
              value={filters.clientSearch ?? ''}
              onChange={e => setFilter('clientSearch', e.target.value || undefined)}
              className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <CalendarDays size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">Sin reservas</p>
          <p className="text-sm mt-1">No se encontraron reservas con los filtros aplicados</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3">Fecha y hora</th>
                <th className="text-left px-5 py-3">Servicio</th>
                <th className="text-left px-5 py-3">Cliente</th>
                <th className="text-left px-5 py-3">Estado</th>
                <th className="text-left px-5 py-3">Precio</th>
                <th className="text-right px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.map(booking => (
                <BookingRow
                  key={booking.id}
                  booking={booking}
                  onConfirm={handleConfirm}
                  onComplete={handleComplete}
                  onNoShow={handleNoShow}
                  onCancel={openCancel}
                />
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                Página {filters.page} de {totalPages} — {data?.totalCount} reservas
              </span>
              <div className="flex gap-2">
                <button
                  disabled={filters.page === 1}
                  onClick={() => setFilters(prev => ({ ...prev, page: (prev.page ?? 1) - 1 }))}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  disabled={filters.page === totalPages}
                  onClick={() => setFilters(prev => ({ ...prev, page: (prev.page ?? 1) + 1 }))}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cancel dialog */}
      {cancelDialog.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Cancelar reserva</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de cancelación</label>
              <textarea
                rows={3}
                value={cancelDialog.reason}
                onChange={e => setCancelDialog(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Ej. Cliente no se comunicó, agenda cerrada..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setCancelDialog({ open: false, bookingId: '', reason: '' })}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Volver
              </button>
              <button
                disabled={!cancelDialog.reason.trim() || cancelBooking.isPending}
                onClick={submitCancel}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

interface BookingRowProps {
  booking: Booking
  onConfirm: (b: Booking) => void
  onComplete: (b: Booking) => void
  onNoShow: (b: Booking) => void
  onCancel: (b: Booking) => void
}

function BookingRow({ booking, onConfirm, onComplete, onNoShow, onCancel }: BookingRowProps) {
  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-5 py-4">
        <div className="font-medium text-gray-900 text-xs">{formatBookingDate(booking.startAt)}</div>
        <div className="text-gray-500 text-xs mt-0.5">{formatBookingTime(booking.startAt, booking.endAt)}</div>
      </td>
      <td className="px-5 py-4 text-gray-700">{booking.serviceName}</td>
      <td className="px-5 py-4 text-gray-500 text-xs">{booking.clientId.slice(0, 8)}…</td>
      <td className="px-5 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${BOOKING_STATUS_COLORS[booking.status]}`}>
          {BOOKING_STATUS_LABELS[booking.status]}
        </span>
      </td>
      <td className="px-5 py-4 text-gray-700">
        {booking.totalPrice.toLocaleString('es-CO', { style: 'currency', currency: booking.currency, minimumFractionDigits: 0 })}
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-2">
          {booking.status === 'Pending' && (
            <button
              onClick={() => onConfirm(booking)}
              title="Confirmar"
              className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
            >
              <CheckCircle size={15} />
            </button>
          )}
          {booking.status === 'Confirmed' && (
            <>
              <button
                onClick={() => onComplete(booking)}
                title="Completar"
                className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Check size={15} />
              </button>
              <button
                onClick={() => onNoShow(booking)}
                title="No se presentó"
                className="p-1.5 rounded-lg text-orange-500 hover:bg-orange-50 transition-colors"
              >
                <AlertCircle size={15} />
              </button>
            </>
          )}
          {canCancelBooking(booking.status) && (
            <button
              onClick={() => onCancel(booking)}
              title="Cancelar"
              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
            >
              <XCircle size={15} />
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}
