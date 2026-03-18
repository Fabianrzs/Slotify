import { bookingsRepository } from '../repositories/bookings.repository'
import type { BookingStatus } from '../types'

export async function updateBookingStatusService(id: string, status: BookingStatus) {
  switch (status) {
    case 'Confirmed':
      return bookingsRepository.confirm(id)
    case 'Completed':
      return bookingsRepository.complete(id)
    case 'NoShow':
      return bookingsRepository.markNoShow(id)
    default:
      throw new Error(`Cannot transition to status: ${status}`)
  }
}
