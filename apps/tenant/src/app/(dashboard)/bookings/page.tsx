'use client'

import { useState } from 'react'
import { CalendarDays, Search, ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertCircle, Check, Clock } from 'lucide-react'
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

  function handleConfirm(booking: Booking) { updateStatus.mutate({ id: booking.id, status: 'Confirmed' }) }
  function handleComplete(booking: Booking) { updateStatus.mutate({ id: booking.id, status: 'Completed' }) }
  function handleNoShow(booking: Booking) { updateStatus.mutate({ id: booking.id, status: 'NoShow' }) }
  function openCancel(booking: Booking) { setCancelDialog({ open: true, bookingId: booking.id, reason: '' }) }

  function submitCancel() {
    if (!cancelDialog.reason.trim()) return
    cancelBooking.mutate(
      { id: cancelDialog.bookingId, reason: cancelDialog.reason },
      { onSuccess: () => setCancelDialog({ open: false, bookingId: '', reason: '' }) },
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>
        <p className="text-slate-500 mt-0.5 text-sm">Gestiona las reservas de tu negocio</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Sede</label>
            <select
              value={filters.branchId ?? ''}
              onChange={e => setFilter('branchId', e.target.value || undefined)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="">Todas las sedes</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Estado</label>
            <select
              value={filters.status ?? ''}
              onChange={e => setFilter('status', (e.target.value as BookingStatus) || undefined)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Desde</label>
            <input
              type="date"
              value={filters.dateFrom ?? ''}
              onChange={e => setFilter('dateFrom', e.target.value || undefined)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Hasta</label>
            <input
              type="date"
              value={filters.dateTo ?? ''}
              onChange={e => setFilter('dateTo', e.target.value || undefined)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar cliente por nombre o email..."
            value={filters.clientSearch ?? ''}
            onChange={e => setFilter('clientSearch', e.target.value || undefined)}
            className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <CalendarDays size={36} className="mx-auto mb-3 text-gray-200" />
          <p className="font-semibold">Sin reservas</p>
          <p className="text-sm mt-1 text-slate-400">No se encontraron reservas con los filtros aplicados</p>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="space-y-3 lg:hidden">
            {bookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{booking.serviceName}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
                        <Clock size={11} />
                        <span>{formatBookingDate(booking.startAt)} · {formatBookingTime(booking.startAt, booking.endAt)}</span>
                      </div>
                    </div>
                    <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${BOOKING_STATUS_COLORS[booking.status]}`}>
                      {BOOKING_STATUS_LABELS[booking.status]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">
                      {booking.totalPrice.toLocaleString('es-CO', { style: 'currency', currency: booking.currency, minimumFractionDigits: 0 })}
                    </p>
                    <div className="flex items-center gap-2">
                      {booking.status === 'Pending' && (
                        <ActionBtn onClick={() => handleConfirm(booking)} title="Confirmar" color="green">
                          <CheckCircle size={15} />
                        </ActionBtn>
                      )}
                      {booking.status === 'Confirmed' && (
                        <>
                          <ActionBtn onClick={() => handleComplete(booking)} title="Completar" color="blue">
                            <Check size={15} />
                          </ActionBtn>
                          <ActionBtn onClick={() => handleNoShow(booking)} title="No se presentó" color="orange">
                            <AlertCircle size={15} />
                          </ActionBtn>
                        </>
                      )}
                      {canCancelBooking(booking.status) && (
                        <ActionBtn onClick={() => openCancel(booking)} title="Cancelar" color="red">
                          <XCircle size={15} />
                        </ActionBtn>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden lg:block bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-400 text-xs uppercase tracking-wide">
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
                  <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900 text-xs">{formatBookingDate(booking.startAt)}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{formatBookingTime(booking.startAt, booking.endAt)}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-700 font-medium">{booking.serviceName}</td>
                    <td className="px-5 py-4 text-slate-400 text-xs font-mono">{booking.clientId.slice(0, 8)}…</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${BOOKING_STATUS_COLORS[booking.status]}`}>
                        {BOOKING_STATUS_LABELS[booking.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-700 font-medium">
                      {booking.totalPrice.toLocaleString('es-CO', { style: 'currency', currency: booking.currency, minimumFractionDigits: 0 })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {booking.status === 'Pending' && (
                          <ActionBtn onClick={() => handleConfirm(booking)} title="Confirmar" color="green">
                            <CheckCircle size={15} />
                          </ActionBtn>
                        )}
                        {booking.status === 'Confirmed' && (
                          <>
                            <ActionBtn onClick={() => handleComplete(booking)} title="Completar" color="blue">
                              <Check size={15} />
                            </ActionBtn>
                            <ActionBtn onClick={() => handleNoShow(booking)} title="No se presentó" color="orange">
                              <AlertCircle size={15} />
                            </ActionBtn>
                          </>
                        )}
                        {canCancelBooking(booking.status) && (
                          <ActionBtn onClick={() => openCancel(booking)} title="Cancelar" color="red">
                            <XCircle size={15} />
                          </ActionBtn>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                <span className="text-xs text-slate-400">
                  Página {filters.page} de {totalPages} · {data?.totalCount} reservas
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

          {/* Mobile pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 lg:hidden">
              <button
                disabled={filters.page === 1}
                onClick={() => setFilters(prev => ({ ...prev, page: (prev.page ?? 1) - 1 }))}
                className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:bg-white disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="text-sm text-slate-400">{filters.page} / {totalPages}</span>
              <button
                disabled={filters.page === totalPages}
                onClick={() => setFilters(prev => ({ ...prev, page: (prev.page ?? 1) + 1 }))}
                className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:bg-white disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {/* Cancel dialog */}
      {cancelDialog.open && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Cancelar reserva</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Motivo de cancelación</label>
              <textarea
                rows={3}
                value={cancelDialog.reason}
                onChange={e => setCancelDialog(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Ej. Cliente no se comunicó..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-200 transition"
              />
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={() => setCancelDialog({ open: false, bookingId: '', reason: '' })}
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

function ActionBtn({ onClick, title, color, children }: {
  onClick: () => void
  title: string
  color: 'green' | 'blue' | 'orange' | 'red'
  children: React.ReactNode
}) {
  const colors = {
    green: 'text-emerald-600 hover:bg-emerald-50',
    blue: 'text-blue-600 hover:bg-blue-50',
    orange: 'text-orange-500 hover:bg-orange-50',
    red: 'text-red-500 hover:bg-red-50',
  }
  return (
    <button onClick={onClick} title={title} className={`p-1.5 rounded-lg transition-colors ${colors[color]}`}>
      {children}
    </button>
  )
}
