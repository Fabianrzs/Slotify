'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Zap } from 'lucide-react'
import { useLogin } from '@/modules/auth/handlers/useAuth.handler'
import { loginSchema, type LoginSchema } from '@/modules/auth/validations/auth.validation'

export default function LoginPage() {
  const login = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-100 rounded-full opacity-30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Slotify</span>
          </div>
          <p className="text-slate-500 text-sm">Inicia sesión en tu panel de administración</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit((data) => login.mutate(data))} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-transparent outline-none transition text-sm"
                placeholder="tu@negocio.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                {...register('password')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 focus:border-transparent outline-none transition text-sm"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {login.error && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                <p className="text-sm text-red-600">
                  {login.error instanceof Error ? login.error.message : 'Correo o contraseña incorrectos.'}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || login.isPending}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm shadow-sm shadow-indigo-200"
            >
              {login.isPending ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>

        <p className="text-center mt-5 text-sm text-slate-500">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-indigo-600 font-semibold hover:underline">
            Registra tu negocio gratis
          </Link>
        </p>
      </div>
    </div>
  )
}
