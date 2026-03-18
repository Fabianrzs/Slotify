import { createHttpClient } from '@/lib/http/client'
import type { TenantProfile } from '../types'

export function createEstablishmentsRepository(slug: string) {
  const http = createHttpClient(slug)

  return {
    getProfile: (coords?: { lat: number; lng: number }): Promise<TenantProfile> => {
      const qs = coords ? `?lat=${coords.lat}&lng=${coords.lng}` : ''
      return http.get(`/api/public/profile${qs}`)
    },
  }
}
