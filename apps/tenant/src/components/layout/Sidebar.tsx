'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CalendarDays,
  LayoutDashboard,
  MapPin,
  Settings,
  Scissors,
  Users,
  BarChart3,
  CreditCard,
  LogOut,
} from 'lucide-react'
import { useLogout } from '@/modules/auth/handlers/useAuth.handler'
import { usePlanUsage } from '@/modules/auth/hooks/usePlanUsage'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/bookings', icon: CalendarDays, label: 'Reservas' },
  { href: '/services', icon: Scissors, label: 'Servicios' },
  { href: '/branches', icon: MapPin, label: 'Sedes' },
  { href: '/staff', icon: Users, label: 'Equipo' },
  { href: '/reports', icon: BarChart3, label: 'Reportes' },
  { href: '/billing', icon: CreditCard, label: 'Facturación' },
  { href: '/settings', icon: Settings, label: 'Configuración' },
]

export function Sidebar() {
  const pathname = usePathname()
  const logout = useLogout()
  const { data: usage } = usePlanUsage()

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-100">
        <span className="text-2xl font-bold text-indigo-600">Slotify</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Plan usage */}
      {usage && (
        <div className="px-4 py-3 mx-3 mb-3 bg-gray-50 rounded-xl text-xs text-gray-600 space-y-2">
          <p className="font-semibold text-gray-700 mb-1">Plan Free</p>
          <UsageBar
            label="Reservas"
            current={usage.bookingsThisMonth}
            max={usage.limits.maxBookingsPerMonth}
          />
          <UsageBar
            label="Servicios"
            current={usage.activeServices}
            max={usage.limits.maxServices}
          />
          <UsageBar
            label="Sedes"
            current={usage.activeBranches}
            max={usage.limits.maxBranches}
          />
        </div>
      )}

      {/* Logout */}
      <div className="px-3 pb-4">
        <button
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

function UsageBar({ label, current, max }: { label: string; current: number; max: number | null }) {
  const pct = max ? Math.min((current / max) * 100, 100) : 0
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span>{label}</span>
        <span className={pct >= 90 ? 'text-red-600 font-medium' : ''}>
          {current}/{max ?? '∞'}
        </span>
      </div>
      {max && (
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full', pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-400' : 'bg-indigo-500')}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  )
}
