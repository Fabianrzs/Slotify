export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'NoShow'

export interface Booking {
  id: string
  tenantId: string
  branchId: string
  serviceId: string
  serviceName: string
  startAt: string
  endAt: string
  status: BookingStatus
  totalPrice: number
  currency: string
  notes?: string
  createdAt: string
}

export interface CreateBookingPayload {
  tenantId: string
  branchId: string
  serviceId: string
  startAt: string
  notes?: string
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  Pending: 'Pendiente',
  Confirmed: 'Confirmada',
  Cancelled: 'Cancelada',
  Completed: 'Completada',
  NoShow: 'No asistí',
}

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
  Completed: 'bg-blue-100 text-blue-800',
  NoShow: 'bg-gray-100 text-gray-800',
}
