'use client'

import { useQuery } from '@tanstack/react-query'
import { createEstablishmentsRepository } from '../repositories/establishments.repository'

export function useGetProfile(slug: string, coords?: { lat: number; lng: number }) {
  return useQuery({
    queryKey: ['profile', slug, coords?.lat, coords?.lng],
    queryFn: () => createEstablishmentsRepository(slug).getProfile(coords),
    staleTime: 5 * 60_000,
    enabled: !!slug,
  })
}
