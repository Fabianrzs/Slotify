import { http } from '@/lib/http/client'
import type { AvailableSlot, GetAvailableDatesParams, GetSlotsParams } from '../types'

export const availabilityRepository = {
  getSlots: ({ branchId, serviceId, date }: GetSlotsParams): Promise<AvailableSlot[]> =>
    http.get(`/api/availability?branchId=${branchId}&serviceId=${serviceId}&date=${date}`),

  getAvailableDates: ({ branchId, serviceId, year, month }: GetAvailableDatesParams): Promise<string[]> =>
    http.get(`/api/availability/month?branchId=${branchId}&serviceId=${serviceId}&year=${year}&month=${month}`),
}
