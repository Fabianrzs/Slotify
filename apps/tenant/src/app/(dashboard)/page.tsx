'use client'

import { CalendarDays, CheckCircle2, Clock4, XCircle } from 'lucide-react'
import { usePlanUsage } from '@/modules/auth/hooks/usePlanUsage'
import { useGetBookings } from '@/modules/bookings'

export default function DashboardPage() {
  const { data: usage } = usePlanUsage()

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const { data: todayBookings } = useGetBookings({
    dateFrom: todayStr,
    dateTo: todayStr,
    pageSize: 100,
  })

  const confirmed = todayBookings?.items.filter(b => b.status === 'Confirmed').length ?? 0
  const pending = todayBookings?.items.filter(b => b.status === 'Pending').length ?? 0
  const cancelled = todayBookings?.items.filter(b => b.status === 'Cancelled').length ?? 0
  const total = todayBookings?.totalCount ?? 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-slate-500 mt-1 text-sm capitalize">
          {today.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Reservas hoy"
          value={total}
          icon={CalendarDays}
          accent="bg-indigo-500"
          bg="bg-white"
          textColor="text-indigo-600"
        />
        <KpiCard
          label="Confirmadas"
          value={confirmed}
          icon={CheckCircle2}
          accent="bg-emerald-500"
          bg="bg-white"
          textColor="text-emerald-600"
        />
        <KpiCard
          label="Pendientes"
          value={pending}
          icon={Clock4}
          accent="bg-amber-400"
          bg="bg-white"
          textColor="text-amber-600"
        />
        <KpiCard
          label="Canceladas"
          value={cancelled}
          icon={XCircle}
          accent="bg-red-400"
          bg="bg-white"
          textColor="text-red-500"
        />
      </div>

      {/* Today's bookings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">Próximas reservas de hoy</h2>
        </div>
        {!todayBookings?.items.length ? (
          <div className="px-6 py-12 text-center">
            <CalendarDays size={32} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">No hay reservas para hoy</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {todayBookings.items
              .filter(b => b.status !== 'Cancelled')
              .slice(0, 8)
              .map(booking => (
                <div key={booking.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                      <CalendarDays size={14} className="text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{booking.serviceName}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(booking.startAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

function KpiCard({
  label,
  value,
  icon: Icon,
  accent,
  bg,
  textColor,
}: {
  label: string
  value: number
  icon: React.ElementType
  accent: string
  bg: string
  textColor: string
}) {
  return (
    <div className={`${bg} rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between`}>
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`w-10 h-10 rounded-xl ${accent} flex items-center justify-center shadow-sm`}>
        <Icon size={18} className="text-white" />
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Confirmed: 'bg-emerald-50 text-emerald-700',
    Pending: 'bg-amber-50 text-amber-700',
    Cancelled: 'bg-gray-100 text-gray-500',
    Completed: 'bg-blue-50 text-blue-700',
  }
  const label: Record<string, string> = {
    Confirmed: 'Confirmada',
    Pending: 'Pendiente',
    Cancelled: 'Cancelada',
    Completed: 'Completada',
  }
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {label[status] ?? status}
    </span>
  )
}
