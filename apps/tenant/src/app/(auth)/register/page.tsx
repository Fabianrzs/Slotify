'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Zap, Check, X } from 'lucide-react'
import { useRegisterTenant, useCheckSlug } from '@/modules/auth/handlers/useAuth.handler'
import { registerTenantSchema, type RegisterTenantSchema } from '@/modules/auth/validations/auth.validation'
import { useDebounce } from '@/hooks/useDebounce'

export default function RegisterPage() {
  const registerTenant = useRegisterTenant()
  const [slugValue, setSlugValue] = useState('')
  const debouncedSlug = useDebounce(slugValue, 500)
  const slugCheck = useCheckSlug(debouncedSlug, debouncedSlug.length >= 4)

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<RegisterTenantSchema>({
    resolver: zodResolver(registerTenantSchema),
    defaultValues: { timezone: 'America/Bogota' },
  })

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
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-100 rounded-full opacity-30 blur-3xl" />
      </div>

      <div className="relative max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Slotify</span>
          </div>
          <p className="text-slate-500 text-sm">Crea tu cuenta gratis en 2 minutos</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
          <form onSubmit={handleSubmit((data) => registerTenant.mutate(data))} className="space-y-5">
            {/* Business section */}
            <div>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Tu negocio</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre del negocio</label>
                  <input
                    {...register('businessName')}
                    onChange={handleBusinessNameChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none transition text-sm"
                    placeholder="Mi Salón de Belleza"
                  />
                  {errors.businessName && (
                    <p className="mt-1 text-xs text-red-500">{errors.businessName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">URL de tu negocio</label>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-300 transition">
                    <span className="px-3 py-2.5 bg-slate-50 text-slate-400 text-xs border-r border-gray-200 whitespace-nowrap">
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
                      <span className="px-3 text-slate-400 text-xs">...</span>
                    )}
                    {slugCheck.data && !slugCheck.isLoading && (
                      <span className={`px-3 flex items-center gap-1 text-xs font-medium ${slugCheck.data.available ? 'text-emerald-600' : 'text-red-500'}`}>
                        {slugCheck.data.available ? <Check size={12} /> : <X size={12} />}
                        {slugCheck.data.available ? 'Disponible' : 'No disponible'}
                      </span>
                    )}
                  </div>
                  {errors.slug && (
                    <p className="mt-1 text-xs text-red-500">{errors.slug.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Account section */}
            <div>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Tu cuenta de acceso</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre completo</label>
                  <input
                    {...register('ownerFullName')}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none transition text-sm"
                    placeholder="Ana García"
                  />
                  {errors.ownerFullName && (
                    <p className="mt-1 text-xs text-red-500">{errors.ownerFullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electrónico</label>
                  <input
                    type="email"
                    {...register('ownerEmail')}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none transition text-sm"
                    placeholder="ana@misalon.com"
                  />
                  {errors.ownerEmail && (
                    <p className="mt-1 text-xs text-red-500">{errors.ownerEmail.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
                    <input
                      type="password"
                      {...register('ownerPassword')}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none transition text-sm"
                      placeholder="Mín. 8 caracteres"
                    />
                    {errors.ownerPassword && (
                      <p className="mt-1 text-xs text-red-500">{errors.ownerPassword.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar</label>
                    <input
                      type="password"
                      {...register('ownerConfirmPassword')}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-300 outline-none transition text-sm"
                      placeholder="Repite"
                    />
                    {errors.ownerConfirmPassword && (
                      <p className="mt-1 text-xs text-red-500">{errors.ownerConfirmPassword.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {registerTenant.error && (
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                <p className="text-sm text-red-600">
                  {registerTenant.error instanceof Error ? registerTenant.error.message : 'Ocurrió un error. Intenta nuevamente.'}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || registerTenant.isPending}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all text-sm shadow-sm shadow-indigo-200"
            >
              {registerTenant.isPending ? 'Creando tu cuenta...' : 'Crear cuenta gratis'}
            </button>

            <p className="text-xs text-center text-slate-400">
              Al registrarte aceptas nuestros Términos de Servicio y Política de Privacidad
            </p>
          </form>
        </div>

        <p className="text-center mt-5 text-sm text-slate-500">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
