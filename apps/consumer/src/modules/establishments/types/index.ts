export interface TenantProfile {
  tenantId: string
  name: string
  slug: string
  logoUrl?: string
  primaryColor?: string
  timezone: string
  currency: string
  minAdvanceBookingHours: number
  maxAdvanceBookingDays: number
  cancellationWindowHours: number
  branches: PublicBranch[]
  services: PublicService[]
}

export interface PublicBranch {
  id: string
  name: string
  address?: string
  phone?: string
  timezone: string
}

export interface PublicService {
  id: string
  name: string
  description?: string
  durationMinutes: number
  price: number
  currency: string
  maxCapacity: number
}
