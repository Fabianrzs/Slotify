'use client'

import { useQuery } from '@tanstack/react-query'
import { http } from '@/lib/http/client'

export interface PlanUsage {
  activeBranches: number
  activeServices: number
  bookingsThisMonth: number
  activeStaffMembers: number
  totalClients: number
  limits: {
    maxBranches: number | null
    maxServices: number | null
    maxBookingsPerMonth: number | null
    maxStaffMembers: number | null
    maxClients: number | null
    allowCustomNotificationTemplates: boolean
    allowAnalytics: boolean
    allowApiAccess: boolean
    allowPromotions: boolean
  }
  gates: {
    canAddBranch: boolean
    canAddService: boolean
    canAddBooking: boolean
    canAddStaff: boolean
  }
}

export function usePlanUsage() {
  return useQuery<PlanUsage>({
    queryKey: ['plan-usage'],
    queryFn: () => http.get('/api/tenant/plan/usage'),
    staleTime: 60_000,
  })
}

/**
 * Returns a human-readable label for a limit.
 * If null (unlimited), returns "Ilimitado".
 */
export function formatLimit(value: number | null): string {
  return value === null ? 'Ilimitado' : String(value)
}

/**
 * Returns a percentage for progress bars.
 * If limit is null, returns 0 (no bar needed).
 */
export function getLimitPercentage(current: number, max: number | null): number {
  if (max === null) return 0
  return Math.min(Math.round((current / max) * 100), 100)
}
