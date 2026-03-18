'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MapPin, Plus, Pencil, CalendarClock, X } from 'lucide-react'
import {
  useGetBranches,
  useCreateBranch,
  useUpdateBranch,
  useSetBranchSchedule,
} from '@/modules/branches'
import type { Branch } from '@/modules/branches'
import {
  branchSchema,
  scheduleSchema,
  type BranchSchema,
  type ScheduleSchema,
} from '@/modules/branches'
import { DAYS_OF_WEEK, DAYS_LABELS } from '@/modules/branches'

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

export default function BranchesPage() {
  const { data: branches = [], isLoading } = useGetBranches()
  const [showForm, setShowForm] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [scheduleBranch, setScheduleBranch] = useState<Branch | null>(null)

  function openCreate() {
    setEditingBranch(null)
    setShowForm(true)
  }

  function openEdit(branch: Branch) {
    setEditingBranch(branch)
    setShowForm(true)
  }

  function openSchedule(branch: Branch) {
    setScheduleBranch(branch)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sedes</h1>
          <p className="text-gray-500 mt-1 text-sm">Gestiona las ubicaciones de tu negocio</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Nueva sede
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : branches.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MapPin size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">Sin sedes registradas</p>
          <p className="text-sm mt-1">Crea tu primera sede para comenzar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map(branch => (
            <div key={branch.id} className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{branch.name}</h3>
                  {branch.address && <p className="text-xs text-gray-500 mt-0.5">{branch.address}</p>}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  branch.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {branch.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                {branch.phone && <p>Tel: {branch.phone}</p>}
                <p>Zona: {branch.timezone}</p>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => openEdit(branch)}
                  className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-indigo-600 border border-gray-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Pencil size={13} />
                  Editar
                </button>
                <button
                  onClick={() => openSchedule(branch)}
                  className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-indigo-600 border border-gray-200 hover:border-indigo-300 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <CalendarClock size={13} />
                  Horario
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <BranchFormModal
          branch={editingBranch}
          onClose={() => setShowForm(false)}
        />
      )}

      {scheduleBranch && (
        <ScheduleModal
          branch={scheduleBranch}
          onClose={() => setScheduleBranch(null)}
        />
      )}
    </div>
  )
}

// ─── Branch Form Modal ────────────────────────────────────────────────────────

function BranchFormModal({ branch, onClose }: { branch: Branch | null; onClose: () => void }) {
  const createBranch = useCreateBranch()
  const updateBranch = useUpdateBranch()
  const isEditing = !!branch

  const { register, handleSubmit, formState: { errors } } = useForm<BranchSchema>({
    resolver: zodResolver(branchSchema),
    defaultValues: branch
      ? { name: branch.name, address: branch.address ?? '', phone: branch.phone ?? '', timezone: branch.timezone }
      : { timezone: 'America/Bogota' },
  })

  async function onSubmit(data: BranchSchema) {
    if (isEditing) {
      await updateBranch.mutateAsync({ id: branch.id, ...data, isActive: branch.isActive })
    } else {
      await createBranch.mutateAsync(data)
    }
    onClose()
  }

  const isPending = createBranch.isPending || updateBranch.isPending

  return (
    <Modal title={isEditing ? 'Editar sede' : 'Nueva sede'} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Nombre" error={errors.name?.message}>
          <input {...register('name')} placeholder="Sede principal" className={inputCls(!!errors.name)} />
        </Field>

        <Field label="Dirección" error={errors.address?.message}>
          <input {...register('address')} placeholder="Calle 123 #45-67" className={inputCls(false)} />
        </Field>

        <Field label="Teléfono" error={errors.phone?.message}>
          <input {...register('phone')} placeholder="+57 300 000 0000" className={inputCls(false)} />
        </Field>

        <Field label="Zona horaria" error={errors.timezone?.message}>
          <select {...register('timezone')} className={inputCls(!!errors.timezone)}>
            {TIMEZONES.map(tz => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear sede'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Schedule Modal ───────────────────────────────────────────────────────────

function ScheduleModal({ branch, onClose }: { branch: Branch; onClose: () => void }) {
  const setSchedule = useSetBranchSchedule()

  const defaultValues: ScheduleSchema = DAYS_OF_WEEK.map(day => {
    const existing = branch.weeklySchedule?.find(s => s.dayOfWeek === day)
    return {
      dayOfWeek: day,
      isOpen: existing?.isOpen ?? (day !== 'Saturday' && day !== 'Sunday'),
      openTime: existing?.openTime ?? '09:00',
      closeTime: existing?.closeTime ?? '18:00',
    }
  })

  const { register, watch, handleSubmit } = useForm<{ schedule: ScheduleSchema }>({
    defaultValues: { schedule: defaultValues },
  })

  const watched = watch('schedule')

  async function onSubmit(data: { schedule: ScheduleSchema }) {
    await setSchedule.mutateAsync({ id: branch.id, schedule: data.schedule })
    onClose()
  }

  return (
    <Modal title={`Horario — ${branch.name}`} onClose={onClose} wide>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {DAYS_OF_WEEK.map((day, idx) => {
          const isOpen = watched?.[idx]?.isOpen
          return (
            <div key={day} className="flex items-center gap-4">
              <input type="hidden" {...register(`schedule.${idx}.dayOfWeek` as const)} />
              <div className="w-28 text-sm text-gray-700 font-medium">{DAYS_LABELS[day]}</div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register(`schedule.${idx}.isOpen` as const)}
                  className="w-4 h-4 accent-indigo-600"
                />
                <span className="text-sm text-gray-600">{isOpen ? 'Abierto' : 'Cerrado'}</span>
              </label>

              {isOpen && (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    {...register(`schedule.${idx}.openTime` as const)}
                    className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <span className="text-gray-400 text-xs">—</span>
                  <input
                    type="time"
                    {...register(`schedule.${idx}.closeTime` as const)}
                    className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              )}
            </div>
          )
        })}

        <div className="flex justify-end gap-2 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={setSchedule.isPending}
            className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 transition-colors"
          >
            {setSchedule.isPending ? 'Guardando...' : 'Guardar horario'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children, wide }: {
  title: string
  onClose: () => void
  children: React.ReactNode
  wide?: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className={`bg-white rounded-2xl shadow-xl w-full ${wide ? 'max-w-lg' : 'max-w-md'} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

function inputCls(hasError: boolean) {
  return `w-full border ${hasError ? 'border-red-300' : 'border-gray-200'} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition`
}
