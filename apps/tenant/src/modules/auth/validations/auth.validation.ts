import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(8, 'Mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
  .regex(/[a-z]/, 'Debe tener al menos una minúscula')
  .regex(/[0-9]/, 'Debe tener al menos un número')
  .regex(/[^a-zA-Z0-9]/, 'Debe tener al menos un carácter especial')

export const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'El nombre es requerido').max(200),
    email: z.string().email('Correo electrónico inválido'),
    password: passwordSchema,
    confirmPassword: z.string(),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{7,14}$/, 'Número de teléfono inválido')
      .optional()
      .or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  })

export const registerTenantSchema = z
  .object({
    businessName: z.string().min(2, 'El nombre del negocio es requerido').max(200),
    slug: z
      .string()
      .min(4, 'Mínimo 4 caracteres')
      .max(50, 'Máximo 50 caracteres')
      .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, 'Solo letras minúsculas, números y guiones'),
    ownerFullName: z.string().min(2, 'Tu nombre es requerido').max(200),
    ownerEmail: z.string().email('Correo electrónico inválido'),
    ownerPassword: passwordSchema,
    ownerConfirmPassword: z.string(),
    ownerPhone: z
      .string()
      .regex(/^\+?[1-9]\d{7,14}$/, 'Número inválido')
      .optional()
      .or(z.literal('')),
    timezone: z.string().default('America/Bogota'),
  })
  .refine((data) => data.ownerPassword === data.ownerConfirmPassword, {
    path: ['ownerConfirmPassword'],
    message: 'Las contraseñas no coinciden',
  })

export const forgotPasswordSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
})

export const resetPasswordSchema = z
  .object({
    email: z.string().email(),
    code: z.string().min(6, 'El código debe tener 6 dígitos').max(6),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  })

export type LoginSchema = z.infer<typeof loginSchema>
export type RegisterSchema = z.infer<typeof registerSchema>
export type RegisterTenantSchema = z.infer<typeof registerTenantSchema>
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>
