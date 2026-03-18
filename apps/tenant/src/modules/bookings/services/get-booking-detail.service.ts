import { bookingsRepository } from '../repositories/bookings.repository'

export async function getBookingDetailService(id: string) {
  return bookingsRepository.getById(id)
}
