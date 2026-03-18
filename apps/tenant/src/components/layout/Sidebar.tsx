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
  Zap,
  X,
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

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()
  const logout = useLogout()
  const { data: usage } = usePlanUsage()

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen shadow-sm">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">Slotify</span>
        </div>
        {/* Close button — only visible on mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={16} className="text-gray-500" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon size={16} className={active ? 'text-white' : 'text-gray-400'} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Plan usage */}
      {usage && (
        <div className="px-3 mb-3">
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-xl px-4 py-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-indigo-700">Plan Free</p>
              <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">Upgrade</span>
            </div>
            <UsageBar label="Reservas" current={usage.bookingsThisMonth} max={usage.limits.maxBookingsPerMonth} />
            <UsageBar label="Servicios" current={usage.activeServices} max={usage.limits.maxServices} />
            <UsageBar label="Sedes" current={usage.activeBranches} max={usage.limits.maxBranches} />
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="px-3 pb-4 border-t border-gray-100 pt-3">
        <button
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
        >
          <LogOut size={16} />
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
      <div className="flex justify-between mb-1.5 text-xs">
        <span className="text-indigo-600/70">{label}</span>
        <span className={cn('font-medium', pct >= 90 ? 'text-red-500' : 'text-indigo-600/70')}>
          {current}/{max ?? '∞'}
        </span>
      </div>
      {max && (
        <div className="h-1 bg-indigo-100 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', pct >= 90 ? 'bg-red-400' : pct >= 70 ? 'bg-amber-400' : 'bg-indigo-500')}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  )
}
