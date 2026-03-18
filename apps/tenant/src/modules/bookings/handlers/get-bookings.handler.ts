'use client'

import { useQuery } from '@tanstack/react-query'
import { listBookingsService } from '../services/list-bookings.service'
import type { BookingFilters } from '../types'

export const BOOKINGS_QUERY_KEY = 'bookings'

export function useGetBookings(filters: BookingFilters) {
  return useQuery({
    queryKey: [BOOKINGS_QUERY_KEY, filters],
    queryFn: () => listBookingsService(filters),
    staleTime: 30_000,
  })
}
