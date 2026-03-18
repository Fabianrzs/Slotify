'use client'

import { useQuery } from '@tanstack/react-query'
import { createEstablishmentsRepository } from '../repositories/establishments.repository'

export function useGetProfile(slug: string) {
  return useQuery({
    queryKey: ['profile', slug],
    queryFn: () => createEstablishmentsRepository(slug).getProfile(),
    staleTime: 5 * 60_000,
    enabled: !!slug,
  })
}
