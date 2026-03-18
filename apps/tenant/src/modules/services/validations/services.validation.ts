import { z } from 'zod'

export const serviceSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200),
  durationMinutes: z
    .number({ invalid_type_error: 'La duración debe ser un número' })
    .int()
    .min(5, 'Mínimo 5 minutos')
    .max(480, 'Máximo 8 horas'),
  price: z.number().min(0, 'El precio no puede ser negativo'),
  currency: z.string().length(3, 'Código de moneda inválido'),
  maxCapacity: z.number().int().min(1, 'Capacidad mínima: 1').max(500),
  description: z.string().max(1000).optional().or(z.literal('')),
  categoryId: z.string().uuid().optional().or(z.literal('')),
})

export type ServiceSchema = z.infer<typeof serviceSchema>
