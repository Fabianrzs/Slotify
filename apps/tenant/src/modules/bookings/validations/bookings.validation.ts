import { z } from 'zod'

export const createBookingSchema = z.object({
  serviceId: z.string().uuid('Selecciona un servicio válido.'),
  branchId: z.string().uuid('Selecciona una sede válida.'),
  startAt: z
    .string()
    .refine((val) => new Date(val) > new Date(), {
      message: 'La reserva debe ser en el futuro.',
    }),
  notes: z.string().max(500, 'Las notas no pueden superar 500 caracteres.').optional(),
})

export const cancelBookingSchema = z.object({
  reason: z
    .string()
    .min(1, 'El motivo de cancelación es requerido.')
    .max(300, 'El motivo no puede superar 300 caracteres.'),
})

export type CreateBookingSchema = z.infer<typeof createBookingSchema>
export type CancelBookingSchema = z.infer<typeof cancelBookingSchema>
