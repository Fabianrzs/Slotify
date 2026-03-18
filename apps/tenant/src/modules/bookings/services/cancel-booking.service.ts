import { bookingsRepository } from '../repositories/bookings.repository'

export async function cancelBookingService(id: string, reason: string) {
  return bookingsRepository.cancel(id, reason)
}
