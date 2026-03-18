import type { BookingStatus } from './types'

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  Pending: 'Pendiente',
  Confirmed: 'Confirmada',
  Cancelled: 'Cancelada',
  Completed: 'Completada',
  NoShow: 'No se presentó',
}

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
  Completed: 'bg-blue-100 text-blue-800',
  NoShow: 'bg-gray-100 text-gray-800',
}

export function formatBookingTime(startAt: string, endAt: string): string {
  const start = new Date(startAt)
  const end = new Date(endAt)
  return `${start.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })} – ${end.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`
}

export function formatBookingDate(startAt: string): string {
  return new Date(startAt).toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function canCancelBooking(status: BookingStatus): boolean {
  return status === 'Pending' || status === 'Confirmed'
}

export function canConfirmBooking(status: BookingStatus): boolean {
  return status === 'Pending'
}
