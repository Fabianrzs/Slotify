'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createBookingsRepository } from '../repositories/bookings.repository'
import type { CreateBookingPayload } from '../types'

const BOOKINGS_KEY = 'my-bookings'

export function useGetMyBookings(slug: string, page = 1) {
  return useQuery({
    queryKey: [BOOKINGS_KEY, slug, page],
    queryFn: () => createBookingsRepository(slug).getAll(page),
    staleTime: 30_000,
  })
}

export function useCreateBooking(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateBookingPayload) =>
      createBookingsRepository(slug).create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BOOKINGS_KEY, slug] })
      queryClient.invalidateQueries({ queryKey: ['availability'] })
    },
  })
}

export function useCancelBooking(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      createBookingsRepository(slug).cancel(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BOOKINGS_KEY, slug] })
      queryClient.invalidateQueries({ queryKey: ['availability'] })
    },
  })
}
