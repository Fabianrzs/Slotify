import { http } from '@/lib/http/client'
import type { TenantInfo, UpdateSettingsPayload } from '../types'

export const settingsRepository = {
  get(): Promise<TenantInfo> {
    return http.get('/api/tenant/settings')
  },

  update(payload: UpdateSettingsPayload): Promise<TenantInfo> {
    return http.put('/api/tenant/settings', payload)
  },
}
