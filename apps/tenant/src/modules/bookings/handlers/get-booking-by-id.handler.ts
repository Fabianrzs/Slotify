'use client'

import { useQuery } from '@tanstack/react-query'
import { getBookingDetailService } from '../services/get-booking-detail.service'
import { BOOKINGS_QUERY_KEY } from './get-bookings.handler'

export function useGetBookingById(id: string) {
  return useQuery({
    queryKey: [BOOKINGS_QUERY_KEY, id],
    queryFn: () => getBookingDetailService(id),
    enabled: !!id,
  })
}
