'use client'

import { useQuery } from '@tanstack/react-query'
import { availabilityRepository } from '../repositories/availability.repository'
import type { GetAvailableDatesParams, GetSlotsParams } from '../types'

const AVAILABILITY_KEY = 'availability'

export function useGetAvailableSlots(params: GetSlotsParams, enabled = true) {
  return useQuery({
    queryKey: [AVAILABILITY_KEY, 'slots', params],
    queryFn: () => availabilityRepository.getSlots(params),
    enabled: enabled && !!params.branchId && !!params.serviceId && !!params.date,
    staleTime: 60_000,
  })
}

export function useGetAvailableDates(params: GetAvailableDatesParams, enabled = true) {
  return useQuery({
    queryKey: [AVAILABILITY_KEY, 'dates', params],
    queryFn: () => availabilityRepository.getAvailableDates(params),
    enabled: enabled && !!params.branchId && !!params.serviceId,
    staleTime: 60_000,
  })
}
