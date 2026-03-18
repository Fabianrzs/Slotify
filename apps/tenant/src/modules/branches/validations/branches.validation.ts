import { z } from 'zod'

export const branchSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200),
  address: z.string().max(500).optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  timezone: z.string().min(1, 'La zona horaria es requerida'),
})

export const scheduleEntrySchema = z.object({
  dayOfWeek: z.string(),
  isOpen: z.boolean(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
}).refine(
  (data) => !data.isOpen || (data.openTime && data.closeTime),
  { message: 'Hora de apertura y cierre son requeridas cuando está abierto' }
)

export const scheduleSchema = z.array(scheduleEntrySchema)

export const scheduleExceptionSchema = z.object({
  date: z.string().min(1, 'La fecha es requerida'),
  isOpen: z.boolean(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
  reason: z.string().min(1, 'El motivo es requerido').max(200),
})

export type BranchSchema = z.infer<typeof branchSchema>
export type ScheduleSchema = z.infer<typeof scheduleSchema>
export type ScheduleExceptionSchema = z.infer<typeof scheduleExceptionSchema>
