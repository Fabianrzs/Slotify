import { z } from 'zod'

export const inviteStaffSchema = z.object({
  email: z.string().email('Email inválido'),
  fullName: z.string().min(1, 'El nombre es requerido').max(200),
  phone: z.string().max(20).optional().or(z.literal('')),
  role: z.enum(['Admin', 'Staff'], { required_error: 'El rol es requerido' }),
})

export type InviteStaffSchema = z.infer<typeof inviteStaffSchema>
