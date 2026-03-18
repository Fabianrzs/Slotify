'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createBookingService } from '../services/create-booking.service'
import { BOOKINGS_QUERY_KEY } from './get-bookings.handler'
import type { CreateBookingPayload } from '../types'

export function useCreateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => createBookingService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BOOKINGS_QUERY_KEY] })
    },
  })
}
