'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cancelBookingService } from '../services/cancel-booking.service'
import { BOOKINGS_QUERY_KEY } from './get-bookings.handler'

export function useCancelBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      cancelBookingService(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BOOKINGS_QUERY_KEY] })
    },
  })
}
