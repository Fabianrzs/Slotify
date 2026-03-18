import { createHttpClient } from '@/lib/http/client'
import type { AvailableSlot } from '../types'

export function createAvailabilityRepository(slug: string) {
  const http = createHttpClient(slug)

  return {
    getSlots: (branchId: string, serviceId: string, date: string): Promise<AvailableSlot[]> =>
      http.get(`/api/availability?branchId=${branchId}&serviceId=${serviceId}&date=${date}`),

    getAvailableDates: (branchId: string, serviceId: string, year: number, month: number): Promise<string[]> =>
      http.get(`/api/availability/month?branchId=${branchId}&serviceId=${serviceId}&year=${year}&month=${month}`),
  }
}
