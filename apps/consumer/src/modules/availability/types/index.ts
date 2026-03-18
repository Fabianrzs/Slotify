export interface AvailableSlot {
  startAt: string
  endAt: string
  currentBookings: number
  maxCapacity: number
  isAvailable: boolean
  remainingSpots: number
}
