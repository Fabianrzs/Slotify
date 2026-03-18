'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRegisterTenant, useCheckSlug } from '@/modules/auth/handlers/useAuth.handler'
import {
  registerTenantSchema,
  type RegisterTenantSchema,
} from '@/modules/auth/validations/auth.validation'
import { useDebounce } from '@/hooks/useDebounce'

export default function RegisterPage() {
  const registerTenant = useRegisterTenant()
  const [slugValue, setSlugValue] = useState('')
  const debouncedSlug = useDebounce(slugValue, 500)

  const slugCheck = useCheckSlug(debouncedSlug, debouncedSlug.length >= 4)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterTenantSchema>({
    resolver: zodResolver(registerTenantSchema),
    defaultValues: { timezone: 'America/Bogota' },
  })

  // Auto-generate slug from business name
  const handleBusinessNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50)

    setValue('slug', slug)
    setSlugValue(slug)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">Slotify</h1>
          <p className="mt-2 text-gray-600">Crea tu cuenta gratis en 2 minutos</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form
            onSubmit={handleSubmit((data) => registerTenant.mutate(data))}
            className="space-y-5"
          >
            {/* Business info */}
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Tu negocio</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del negocio
              </label>
              <input
                {...register('businessName')}
                onChange={handleBusinessNameChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Mi Salón de Belleza"
              />
              {errors.businessName && (
                <p className="mt-1 text-xs text-red-600">{errors.businessName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL de tu negocio
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                <span className="px-3 py-2.5 bg-gray-50 text-gray-500 text-sm border-r border-gray-300">
                  slotify.com/
                </span>
                <input
                  {...register('slug')}
                  onChange={(e) => {
                    register('slug').onChange(e)
                    setSlugValue(e.target.value)
                  }}
                  className="flex-1 px-3 py-2.5 outline-none text-sm"
                  placeholder="mi-salon"
                />
                {slugCheck.isLoading && (
                  <span className="px-3 text-gray-400 text-xs">...</span>
                )}
                {slugCheck.data && !slugCheck.isLoading && (
                  <span
                    className={`px-3 text-xs font-medium ${
                      slugCheck.data.available ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {slugCheck.data.available ? 'Disponible' : 'No disponible'}
                  </span>
                )}
              </div>
              {errors.slug && (
                <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>
              )}
            </div>

            {/* Owner info */}
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 pt-2">
              Tu cuenta de acceso
            </h2>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                <input
                  {...register('ownerFullName')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ana García"
                />
                {errors.ownerFullName && (
                  <p className="mt-1 text-xs text-red-600">{errors.ownerFullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  {...register('ownerEmail')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="ana@misalon.com"
                />
                {errors.ownerEmail && (
                  <p className="mt-1 text-xs text-red-600">{errors.ownerEmail.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input
                  type="password"
                  {...register('ownerPassword')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Mínimo 8 caracteres"
                />
                {errors.ownerPassword && (
                  <p className="mt-1 text-xs text-red-600">{errors.ownerPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  {...register('ownerConfirmPassword')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Repite tu contraseña"
                />
                {errors.ownerConfirmPassword && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.ownerConfirmPassword.message}
                  </p>
                )}
              </div>
            </div>

            {registerTenant.error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-700">
                  {registerTenant.error instanceof Error
                    ? registerTenant.error.message
                    : 'Ocurrió un error. Intenta nuevamente.'}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || registerTenant.isPending}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {registerTenant.isPending ? 'Creando tu cuenta...' : 'Crear cuenta gratis'}
            </button>

            <p className="text-xs text-center text-gray-500">
              Al registrarte aceptas nuestros Términos de Servicio y Política de Privacidad
            </p>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-indigo-600 font-medium hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
