'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import {
  useForgotPassword,
  useResetPassword,
} from '@/modules/auth/handlers/useAuth.handler'
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordSchema,
  type ResetPasswordSchema,
} from '@/modules/auth/validations/auth.validation'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'request' | 'confirm'>('request')
  const [email, setEmail] = useState('')

  const forgotPassword = useForgotPassword()
  const resetPassword = useResetPassword()

  const requestForm = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const resetForm = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email },
  })

  const handleRequest = async (data: ForgotPasswordSchema) => {
    await forgotPassword.mutateAsync(data.email)
    setEmail(data.email)
    resetForm.setValue('email', data.email)
    setStep('confirm')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">Slotify</h1>
          <p className="mt-2 text-gray-600">
            {step === 'request' ? 'Recuperar contraseña' : 'Ingresa el código recibido'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {step === 'request' ? (
            <form onSubmit={requestForm.handleSubmit(handleRequest)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  {...requestForm.register('email')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="tu@negocio.com"
                />
                {requestForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-red-600">
                    {requestForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={forgotPassword.isPending}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {forgotPassword.isPending ? 'Enviando...' : 'Enviar código'}
              </button>
            </form>
          ) : (
            <form
              onSubmit={resetForm.handleSubmit((data) => resetPassword.mutate({
                email: data.email!,
                code: data.code!,
                newPassword: data.newPassword!,
              }))}
              className="space-y-5"
            >
              <p className="text-sm text-gray-600 bg-indigo-50 rounded-lg px-4 py-3">
                Enviamos un código de 6 dígitos a <strong>{email}</strong>
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                <input
                  {...resetForm.register('code')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none tracking-widest text-center text-xl"
                  placeholder="123456"
                  maxLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  {...resetForm.register('newPassword')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                {resetForm.formState.errors.newPassword && (
                  <p className="mt-1 text-xs text-red-600">
                    {resetForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  {...resetForm.register('confirmPassword')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={resetPassword.isPending}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {resetPassword.isPending ? 'Actualizando...' : 'Cambiar contraseña'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-6 text-sm text-gray-600">
          <Link href="/login" className="text-indigo-600 font-medium hover:underline">
            Volver al login
          </Link>
        </p>
      </div>
    </div>
  )
}
