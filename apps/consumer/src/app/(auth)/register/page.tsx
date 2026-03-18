'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { http } from '@/lib/http/client'

const schema = z.object({
  fullName: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setError(null)
    try {
      await http.post('/api/auth/register', data)
      router.push('/login?registered=1')
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? 'Error al registrarse')
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Crear cuenta</h2>
        <p className="text-sm text-gray-500 mt-1">Regístrate para empezar a reservar</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
          <input
            {...register('fullName')}
            placeholder="María García"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            {...register('email')}
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono <span className="text-gray-400">(opcional)</span></label>
          <input
            {...register('phone')}
            type="tel"
            placeholder="+57 300 000 0000"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
          <input
            {...register('password')}
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
        >
          {isSubmitting ? 'Registrando...' : 'Crear cuenta'}
        </button>
      </form>

      <p className="text-sm text-center text-gray-500">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-indigo-600 hover:underline font-medium">
          Iniciar sesión
        </Link>
      </p>
    </div>
  )
}
