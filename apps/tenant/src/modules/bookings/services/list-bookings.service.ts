import { bookingsRepository } from '../repositories/bookings.repository'
import type { BookingFilters } from '../types'

export async function listBookingsService(filters: BookingFilters) {
  return bookingsRepository.getAll(filters)
}
