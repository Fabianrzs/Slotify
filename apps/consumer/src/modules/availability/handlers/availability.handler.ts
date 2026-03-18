'use client'

import { useQuery } from '@tanstack/react-query'
import { createAvailabilityRepository } from '../repositories/availability.repository'

export function useGetAvailableDates(
  slug: string,
  branchId: string,
  serviceId: string,
  year: number,
  month: number,
  enabled = true
) {
  return useQuery({
    queryKey: ['availability', 'dates', slug, branchId, serviceId, year, month],
    queryFn: () => createAvailabilityRepository(slug).getAvailableDates(branchId, serviceId, year, month),
    enabled: enabled && !!branchId && !!serviceId,
    staleTime: 60_000,
  })
}

export function useGetAvailableSlots(
  slug: string,
  branchId: string,
  serviceId: string,
  date: string,
  enabled = true
) {
  return useQuery({
    queryKey: ['availability', 'slots', slug, branchId, serviceId, date],
    queryFn: () => createAvailabilityRepository(slug).getSlots(branchId, serviceId, date),
    enabled: enabled && !!branchId && !!serviceId && !!date,
    staleTime: 30_000,
  })
}
