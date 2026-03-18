export interface StaffMember {
  id: string
  userId: string
  email: string
  fullName: string
  phone?: string
  role: 'Owner' | 'Admin' | 'Staff'
  isActive: boolean
  createdAt: string
}

export interface InviteStaffPayload {
  email: string
  fullName: string
  phone?: string
  role: 'Admin' | 'Staff'
}

export interface UpdateStaffRolePayload {
  role: 'Admin' | 'Staff'
}

export const ROLE_LABELS: Record<string, string> = {
  Owner: 'Propietario',
  Admin: 'Administrador',
  Staff: 'Personal',
}
