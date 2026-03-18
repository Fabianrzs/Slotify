import { http } from '@/lib/http/client'
import type { StaffMember, InviteStaffPayload, UpdateStaffRolePayload } from '../types'

export const staffRepository = {
  getAll(): Promise<StaffMember[]> {
    return http.get('/api/staff')
  },

  invite(payload: InviteStaffPayload): Promise<StaffMember> {
    return http.post('/api/staff/invite', payload)
  },

  updateRole(id: string, payload: UpdateStaffRolePayload): Promise<StaffMember> {
    return http.patch(`/api/staff/${id}/role`, payload)
  },
}
