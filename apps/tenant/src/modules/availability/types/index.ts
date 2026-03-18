export interface AvailableSlot {
  startAt: string
  endAt: string
  currentBookings: number
  maxCapacity: number
  isAvailable: boolean
  remainingSpots: number
}

export interface GetSlotsParams {
  branchId: string
  serviceId: string
  date: string // yyyy-MM-dd
}

export interface GetAvailableDatesParams {
  branchId: string
  serviceId: string
  year: number
  month: number
}
