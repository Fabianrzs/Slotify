export interface TenantSettings {
  timezone: string
  currency: string
  minAdvanceBookingHours: number
  maxAdvanceBookingDays: number
  cancellationWindowHours: number
  logoUrl?: string
  primaryColor?: string
}

export interface TenantInfo {
  id: string
  name: string
  slug: string
  settings: TenantSettings
}

export interface UpdateSettingsPayload extends TenantSettings {}
