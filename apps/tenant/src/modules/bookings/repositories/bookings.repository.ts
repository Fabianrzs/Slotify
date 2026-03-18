import { http } from '@/lib/http/client'
import type { Booking, BookingDetail, BookingFilters, CreateBookingPayload } from '../types'
import { buildBookingsQueryParams } from '../filters/bookings.filter'
import type { PaginatedList } from '@/types/pagination'

export const bookingsRepository = {
  async getAll(filters: BookingFilters): Promise<PaginatedList<Booking>> {
    const params = buildBookingsQueryParams(filters)
    return http.get(`/api/bookings?${params.toString()}`)
  },

  async getById(id: string): Promise<BookingDetail> {
    return http.get(`/api/bookings/${id}`)
  },

  async create(payload: CreateBookingPayload): Promise<Booking> {
    return http.post('/api/bookings', payload)
  },

  async cancel(id: string, reason: string): Promise<void> {
    return http.patch(`/api/bookings/${id}/cancel`, { reason })
  },

  async confirm(id: string): Promise<void> {
    return http.patch(`/api/bookings/${id}/status`, { status: 'Confirmed' })
  },

  async complete(id: string): Promise<void> {
    return http.patch(`/api/bookings/${id}/status`, { status: 'Completed' })
  },

  async markNoShow(id: string): Promise<void> {
    return http.patch(`/api/bookings/${id}/status`, { status: 'NoShow' })
  },
}
