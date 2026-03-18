import { createHttpClient } from '@/lib/http/client'
import type { TenantProfile } from '../types'

export function createEstablishmentsRepository(slug: string) {
  const http = createHttpClient(slug)

  return {
    getProfile: (): Promise<TenantProfile> => http.get('/api/public/profile'),
  }
}
