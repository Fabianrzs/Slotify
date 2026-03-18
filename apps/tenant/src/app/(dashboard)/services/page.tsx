'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Scissors, Plus, Pencil, X, Clock, Users, DollarSign } from 'lucide-react'
import {
  useGetServices,
  useCreateService,
  useUpdateService,
  useToggleService,
} from '@/modules/services'
import type { Service } from '@/modules/services'
import { serviceSchema, type ServiceSchema } from '@/modules/services'
import { formatCurrency } from '@/lib/utils'

const CURRENCIES = ['COP', 'USD', 'EUR', 'MXN', 'ARS', 'PEN', 'CLP']

export default function ServicesPage() {
  const [activeOnly, setActiveOnly] = useState(false)
  const { data: services = [], isLoading } = useGetServices({ activeOnly: activeOnly || undefined })
  const toggleService = useToggleService()
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  function openCreate() { setEditingService(null); setShowForm(true) }
  function openEdit(service: Service) { setEditingService(service); setShowForm(true) }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Servicios</h1>
          <p className="text-slate-500 mt-0.5 text-sm">Configura los servicios que ofreces</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-indigo-200"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Nuevo servicio</span>
          <span className="sm:hidden">Nuevo</span>
        </button>
      </div>

      {/* Filter */}
      <label className="inline-flex items-center gap-2 text-sm text-slate-500 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={activeOnly}
          onChange={e => setActiveOnly(e.target.checked)}
          className="w-4 h-4 accent-indigo-600"
        />
        Solo activos
      </label>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Scissors size={36} className="mx-auto mb-3 text-gray-200" />
          <p className="font-semibold">Sin servicios registrados</p>
          <p className="text-sm mt-1 text-slate-400">Crea tu primer servicio para comenzar</p>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="space-y-3 lg:hidden">
            {services.map(service => (
              <div key={service.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{service.name}</p>
                    {service.categoryName && <p className="text-xs text-slate-400">{service.categoryName}</p>}
                    {service.description && (
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{service.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => toggleService.mutate({ id: service.id, isActive: !service.isActive })}
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none ${service.isActive ? 'bg-indigo-600' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${service.isActive ? 'translate-x-4' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Clock size={12} />{service.durationMinutes} min</span>
                    <span className="flex items-center gap-1"><Users size={12} />{service.maxCapacity}</span>
                    <span className="flex items-center gap-1 font-semibold text-gray-700"><DollarSign size={12} />{formatCurrency(service.price, service.currency)}</span>
                  </div>
                  <button
                    onClick={() => openEdit(service)}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 border border-gray-200 hover:border-indigo-300 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    <Pencil size={12} />Editar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden lg:block bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-400 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-3">Servicio</th>
                  <th className="text-left px-5 py-3">Duración</th>
                  <th className="text-left px-5 py-3">Precio</th>
                  <th className="text-left px-5 py-3">Capacidad</th>
                  <th className="text-left px-5 py-3">Estado</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {services.map(service => (
                  <tr key={service.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">{service.name}</p>
                      {service.categoryName && <p className="text-xs text-slate-400">{service.categoryName}</p>}
                      {service.description && (
                        <p className="text-xs text-slate-400 mt-0.5 max-w-xs truncate">{service.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      <span className="flex items-center gap-1"><Clock size={13} className="opacity-60" />{service.durationMinutes} min</span>
                    </td>
                    <td className="px-5 py-4 text-gray-700 font-medium">
                      <span className="flex items-center gap-1"><DollarSign size={13} className="opacity-60" />{formatCurrency(service.price, service.currency)}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      <span className="flex items-center gap-1"><Users size={13} className="opacity-60" />{service.maxCapacity}</span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleService.mutate({ id: service.id, isActive: !service.isActive })}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${service.isActive ? 'bg-indigo-600' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${service.isActive ? 'translate-x-4' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => openEdit(service)}
                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 border border-gray-200 hover:border-indigo-300 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <Pencil size={12} />Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showForm && (
        <ServiceFormModal service={editingService} onClose={() => setShowForm(false)} />
      )}
    </div>
  )
}

// ─── Service Form Modal ────────────────────────────────────────────────────────

function ServiceFormModal({ service, onClose }: { service: Service | null; onClose: () => void }) {
  const createService = useCreateService()
  const updateService = useUpdateService()
  const isEditing = !!service

  const { register, handleSubmit, formState: { errors } } = useForm<ServiceSchema>({
    resolver: zodResolver(serviceSchema),
    defaultValues: service
      ? {
          name: service.name,
          durationMinutes: service.durationMinutes,
          price: service.price,
          currency: service.currency,
          maxCapacity: service.maxCapacity,
          description: service.description ?? '',
        }
      : { currency: 'COP', maxCapacity: 1, durationMinutes: 60, price: 0 },
  })

  async function onSubmit(data: ServiceSchema) {
    const payload = {
      name: data.name!,
      durationMinutes: data.durationMinutes!,
      price: data.price!,
      currency: data.currency!,
      maxCapacity: data.maxCapacity!,
      categoryId: data.categoryId || undefined,
      description: data.description || undefined,
    }
    if (isEditing) {
      await updateService.mutateAsync({ id: service.id, ...payload })
    } else {
      await createService.mutateAsync(payload)
    }
    onClose()
  }

  const isPending = createService.isPending || updateService.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">{isEditing ? 'Editar servicio' : 'Nuevo servicio'}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <Field label="Nombre" error={errors.name?.message}>
            <input {...register('name')} placeholder="Corte de cabello" className={inputCls(!!errors.name)} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Duración (min)" error={errors.durationMinutes?.message}>
              <input type="number" {...register('durationMinutes', { valueAsNumber: true })} placeholder="60" className={inputCls(!!errors.durationMinutes)} />
            </Field>
            <Field label="Capacidad máx." error={errors.maxCapacity?.message}>
              <input type="number" {...register('maxCapacity', { valueAsNumber: true })} placeholder="1" className={inputCls(!!errors.maxCapacity)} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Precio" error={errors.price?.message}>
              <input type="number" step="0.01" {...register('price', { valueAsNumber: true })} placeholder="50000" className={inputCls(!!errors.price)} />
            </Field>
            <Field label="Moneda" error={errors.currency?.message}>
              <select {...register('currency')} className={inputCls(!!errors.currency)}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Descripción" error={errors.description?.message}>
            <textarea {...register('description')} rows={3} placeholder="Descripción del servicio..." className={inputCls(false) + ' resize-none'} />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 transition-all shadow-sm shadow-indigo-200"
            >
              {isPending ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Shared UI ─────────────────────────────────────────────────────────────────

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

function inputCls(hasError: boolean) {
  return `w-full border ${hasError ? 'border-red-300' : 'border-gray-200'} rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition`
}
