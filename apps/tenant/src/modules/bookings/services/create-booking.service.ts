import { bookingsRepository } from '../repositories/bookings.repository'
import type { CreateBookingPayload } from '../types'

export async function createBookingService(payload: CreateBookingPayload) {
  return bookingsRepository.create(payload)
}
