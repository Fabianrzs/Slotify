'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Users, Plus, X, Mail, Phone } from 'lucide-react'
import {
  useGetStaff,
  useInviteStaff,
  useUpdateStaffRole,
  ROLE_LABELS,
  type StaffMember,
  inviteStaffSchema,
  type InviteStaffSchema,
} from '@/modules/staff'

export default function StaffPage() {
  const { data: staff = [], isLoading } = useGetStaff()
  const [showInvite, setShowInvite] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipo</h1>
          <p className="text-gray-500 mt-1 text-sm">Gestiona los miembros de tu equipo</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Invitar miembro
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : staff.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">Sin miembros de equipo</p>
          <p className="text-sm mt-1">Invita a tu equipo para comenzar</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3">Miembro</th>
                <th className="text-left px-5 py-3">Contacto</th>
                <th className="text-left px-5 py-3">Rol</th>
                <th className="text-left px-5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {staff.map(member => (
                <StaffRow key={member.id} member={member} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
    </div>
  )
}

// ─── Staff Row ────────────────────────────────────────────────────────────────

function StaffRow({ member }: { member: StaffMember }) {
  const updateRole = useUpdateStaffRole()

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold uppercase">
            {member.fullName.charAt(0)}
          </div>
          <p className="font-medium text-gray-900">{member.fullName}</p>
        </div>
      </td>
      <td className="px-5 py-4 text-gray-500">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Mail size={12} className="opacity-60" />
            <span className="text-xs">{member.email}</span>
          </div>
          {member.phone && (
            <div className="flex items-center gap-1.5">
              <Phone size={12} className="opacity-60" />
              <span className="text-xs">{member.phone}</span>
            </div>
          )}
        </div>
      </td>
      <td className="px-5 py-4">
        {member.role === 'Owner' ? (
          <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-1 rounded-full">
            {ROLE_LABELS[member.role]}
          </span>
        ) : (
          <select
            value={member.role}
            onChange={e => updateRole.mutate({ id: member.id, role: e.target.value as 'Admin' | 'Staff' })}
            disabled={updateRole.isPending}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
          >
            <option value="Admin">{ROLE_LABELS.Admin}</option>
            <option value="Staff">{ROLE_LABELS.Staff}</option>
          </select>
        )}
      </td>
      <td className="px-5 py-4">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          member.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
        }`}>
          {member.isActive ? 'Activo' : 'Inactivo'}
        </span>
      </td>
    </tr>
  )
}

// ─── Invite Modal ─────────────────────────────────────────────────────────────

function InviteModal({ onClose }: { onClose: () => void }) {
  const inviteStaff = useInviteStaff()
  const { register, handleSubmit, formState: { errors } } = useForm<InviteStaffSchema>({
    resolver: zodResolver(inviteStaffSchema),
    defaultValues: { role: 'Staff' },
  })

  async function onSubmit(data: InviteStaffSchema) {
    await inviteStaff.mutateAsync({
      ...data,
      phone: data.phone || undefined,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Invitar miembro</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-500">
            El miembro recibirá una invitación con acceso temporal para configurar su contraseña.
          </p>

          <Field label="Nombre completo" error={errors.fullName?.message}>
            <input {...register('fullName')} placeholder="María García" className={inputCls(!!errors.fullName)} />
          </Field>

          <Field label="Email" error={errors.email?.message}>
            <input {...register('email')} type="email" placeholder="maria@ejemplo.com" className={inputCls(!!errors.email)} />
          </Field>

          <Field label="Teléfono" error={errors.phone?.message}>
            <input {...register('phone')} placeholder="+57 300 000 0000" className={inputCls(false)} />
          </Field>

          <Field label="Rol" error={errors.role?.message}>
            <select {...register('role')} className={inputCls(!!errors.role)}>
              <option value="Staff">Personal</option>
              <option value="Admin">Administrador</option>
            </select>
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={inviteStaff.isPending}
              className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 transition-colors"
            >
              {inviteStaff.isPending ? 'Enviando...' : 'Enviar invitación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

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
