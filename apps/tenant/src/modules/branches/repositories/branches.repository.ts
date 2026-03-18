import { http } from '@/lib/http/client'
import type { Branch, CreateBranchPayload, ScheduleEntry, ScheduleException, UpdateBranchPayload } from '../types'

export const branchesRepository = {
  getAll: (activeOnly?: boolean): Promise<Branch[]> =>
    http.get(`/api/branches${activeOnly !== undefined ? `?activeOnly=${activeOnly}` : ''}`),

  create: (payload: CreateBranchPayload): Promise<Branch> =>
    http.post('/api/branches', payload),

  update: (id: string, payload: UpdateBranchPayload): Promise<Branch> =>
    http.put(`/api/branches/${id}`, payload),

  setSchedule: (id: string, schedule: ScheduleEntry[]): Promise<void> =>
    http.put(`/api/branches/${id}/schedule`, schedule),

  addException: (id: string, exception: Omit<ScheduleException, 'id'>): Promise<ScheduleException> =>
    http.post(`/api/branches/${id}/exceptions`, exception),
}
