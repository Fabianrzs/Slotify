import { createHttpClient } from '@/lib/http/client'
import type { Booking, CreateBookingPayload } from '../types'
import type { PaginatedList } from '@/types'

export function createBookingsRepository(slug: string) {
  const http = createHttpClient(slug)

  return {
    create: (payload: CreateBookingPayload): Promise<Booking> =>
      http.post('/api/bookings', payload),

    getAll: (page = 1, pageSize = 10): Promise<PaginatedList<Booking>> =>
      http.get(`/api/bookings?page=${page}&pageSize=${pageSize}`),

    cancel: (id: string, reason: string): Promise<void> =>
      http.patch(`/api/bookings/${id}/cancel`, { reason }),
  }
}
