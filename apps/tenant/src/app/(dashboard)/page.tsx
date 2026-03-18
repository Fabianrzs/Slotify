'use client'

import { usePlanUsage } from '@/modules/auth/hooks/usePlanUsage'
import { useGetBookings } from '@/modules/bookings'
import { formatCurrency } from '@/lib/utils'

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          {today.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Reservas hoy" value={todayBookings?.totalCount ?? 0} color="indigo" />
        <KpiCard label="Confirmadas" value={confirmed} color="green" />
        <KpiCard label="Pendientes" value={pending} color="yellow" />
        <KpiCard label="Canceladas" value={cancelled} color="red" />
      </div>

      {/* Today's bookings preview */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Próximas reservas de hoy</h2>
        {!todayBookings?.items.length ? (
          <p className="text-gray-500 text-sm">No hay reservas para hoy.</p>
        ) : (
          <div className="space-y-3">
            {todayBookings.items
              .filter(b => b.status !== 'Cancelled')
              .slice(0, 5)
              .map(booking => (
                <div key={booking.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{booking.serviceName}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(booking.startAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                    booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {booking.status === 'Confirmed' ? 'Confirmada' : booking.status === 'Pending' ? 'Pendiente' : booking.status}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

function KpiCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    red: 'bg-red-50 text-red-700',
  }
  return (
    <div className={`rounded-2xl p-5 ${colors[color]}`}>
      <p className="text-sm font-medium opacity-75">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  )
}
