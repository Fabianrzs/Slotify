import { http } from '@/lib/http/client'
import type { CreateServicePayload, Service, UpdateServicePayload } from '../types'

export const servicesRepository = {
  getAll: (params?: { activeOnly?: boolean; categoryId?: string }): Promise<Service[]> => {
    const query = new URLSearchParams()
    if (params?.activeOnly !== undefined) query.set('activeOnly', String(params.activeOnly))
    if (params?.categoryId) query.set('categoryId', params.categoryId)
    return http.get(`/api/services${query.size ? `?${query}` : ''}`)
  },

  create: (payload: CreateServicePayload): Promise<Service> =>
    http.post('/api/services', payload),

  update: (id: string, payload: UpdateServicePayload): Promise<Service> =>
    http.put(`/api/services/${id}`, payload),

  toggle: (id: string, isActive: boolean): Promise<void> =>
    http.patch(`/api/services/${id}/toggle`, { isActive }),
}
