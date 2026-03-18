'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Settings, Save } from 'lucide-react'
import { useGetSettings, useUpdateSettings } from '@/modules/settings'
import type { UpdateSettingsPayload } from '@/modules/settings'

const TIMEZONES = [
  'America/Bogota',
  'America/Mexico_City',
  'America/Lima',
  'America/Santiago',
  'America/Buenos_Aires',
  'America/Caracas',
  'America/Guayaquil',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/Madrid',
]

const CURRENCIES = ['COP', 'USD', 'EUR', 'MXN', 'ARS', 'PEN', 'CLP']

const settingsFormSchema = z.object({
  timezone: z.string().min(1, 'La zona horaria es requerida'),
  currency: z.string().length(3, 'Moneda inválida'),
  minAdvanceBookingHours: z.number().int().min(0).max(720),
  maxAdvanceBookingDays: z.number().int().min(1).max(365),
  cancellationWindowHours: z.number().int().min(0).max(720),
  logoUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  primaryColor: z.string().regex(/^#([0-9a-fA-F]{6})$/, 'Color inválido (usa #RRGGBB)').optional().or(z.literal('')),
})

type SettingsFormSchema = z.infer<typeof settingsFormSchema>

export default function SettingsPage() {
  const { data: tenantInfo, isLoading } = useGetSettings()
  const updateSettings = useUpdateSettings()

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<SettingsFormSchema>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      timezone: 'America/Bogota',
      currency: 'COP',
      minAdvanceBookingHours: 1,
      maxAdvanceBookingDays: 30,
      cancellationWindowHours: 24,
      logoUrl: '',
      primaryColor: '',
    },
  })

  useEffect(() => {
    if (tenantInfo?.settings) {
      reset({
        timezone: tenantInfo.settings.timezone,
        currency: tenantInfo.settings.currency,
        minAdvanceBookingHours: tenantInfo.settings.minAdvanceBookingHours,
        maxAdvanceBookingDays: tenantInfo.settings.maxAdvanceBookingDays,
        cancellationWindowHours: tenantInfo.settings.cancellationWindowHours,
        logoUrl: tenantInfo.settings.logoUrl ?? '',
        primaryColor: tenantInfo.settings.primaryColor ?? '',
      })
    }
  }, [tenantInfo, reset])

  async function onSubmit(data: SettingsFormSchema) {
    const payload: UpdateSettingsPayload = {
      timezone: data.timezone!,
      currency: data.currency!,
      minAdvanceBookingHours: data.minAdvanceBookingHours!,
      maxAdvanceBookingDays: data.maxAdvanceBookingDays!,
      cancellationWindowHours: data.cancellationWindowHours!,
      logoUrl: data.logoUrl || undefined,
      primaryColor: data.primaryColor || undefined,
    }
    await updateSettings.mutateAsync(payload)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Settings size={24} className="text-gray-400" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          {tenantInfo && (
            <p className="text-gray-500 mt-0.5 text-sm">
              {tenantInfo.name} · <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{tenantInfo.slug}</span>
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* General */}
        <Section title="General" description="Configuración de zona horaria y moneda">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Zona horaria" error={errors.timezone?.message}>
              <select {...register('timezone')} className={inputCls(!!errors.timezone)}>
                {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </Field>
            <Field label="Moneda" error={errors.currency?.message}>
              <select {...register('currency')} className={inputCls(!!errors.currency)}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
        </Section>

        {/* Booking rules */}
        <Section title="Reglas de reserva" description="Controla cómo y cuándo pueden hacerse reservas">
          <div className="space-y-4">
            <Field
              label="Anticipación mínima (horas)"
              error={errors.minAdvanceBookingHours?.message}
              hint="Tiempo mínimo de anticipación que debe tener una reserva"
            >
              <input
                type="number"
                {...register('minAdvanceBookingHours', { valueAsNumber: true })}
                className={inputCls(!!errors.minAdvanceBookingHours)}
              />
            </Field>

            <Field
              label="Anticipación máxima (días)"
              error={errors.maxAdvanceBookingDays?.message}
              hint="Con cuántos días de anticipación puede hacerse una reserva"
            >
              <input
                type="number"
                {...register('maxAdvanceBookingDays', { valueAsNumber: true })}
                className={inputCls(!!errors.maxAdvanceBookingDays)}
              />
            </Field>

            <Field
              label="Ventana de cancelación (horas)"
              error={errors.cancellationWindowHours?.message}
              hint="Hasta cuántas horas antes puede cancelarse una reserva"
            >
              <input
                type="number"
                {...register('cancellationWindowHours', { valueAsNumber: true })}
                className={inputCls(!!errors.cancellationWindowHours)}
              />
            </Field>
          </div>
        </Section>

        {/* Branding */}
        <Section title="Marca" description="Personaliza la apariencia de tu portal de reservas">
          <div className="space-y-4">
            <Field label="URL del logo" error={errors.logoUrl?.message}>
              <input
                {...register('logoUrl')}
                type="url"
                placeholder="https://..."
                className={inputCls(!!errors.logoUrl)}
              />
            </Field>

            <Field label="Color principal" error={errors.primaryColor?.message} hint="Formato hexadecimal, ej: #4F46E5">
              <div className="flex gap-2">
                <input
                  {...register('primaryColor')}
                  placeholder="#4F46E5"
                  className={inputCls(!!errors.primaryColor) + ' flex-1'}
                />
              </div>
            </Field>
          </div>
        </Section>

        {/* Save */}
        <div className="flex items-center justify-between pt-2">
          {updateSettings.isSuccess && (
            <p className="text-sm text-green-600 font-medium">Cambios guardados correctamente</p>
          )}
          {updateSettings.isError && (
            <p className="text-sm text-red-600">Error al guardar. Intenta nuevamente.</p>
          )}
          {!updateSettings.isSuccess && !updateSettings.isError && <span />}

          <button
            type="submit"
            disabled={updateSettings.isPending || !isDirty}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 transition-colors"
          >
            <Save size={15} />
            {updateSettings.isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Section({ title, description, children }: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
      <div>
        <h2 className="font-semibold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  )
}

function Field({ label, error, hint, children }: {
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

function inputCls(hasError: boolean) {
  return `w-full border ${hasError ? 'border-red-300' : 'border-gray-200'} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition`
}
