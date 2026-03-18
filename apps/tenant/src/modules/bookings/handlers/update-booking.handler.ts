'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateBookingStatusService } from '../services/update-booking.service'
import { BOOKINGS_QUERY_KEY } from './get-bookings.handler'
import type { BookingStatus } from '../types'

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      updateBookingStatusService(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [BOOKINGS_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [BOOKINGS_QUERY_KEY, id] })
    },
  })
}
