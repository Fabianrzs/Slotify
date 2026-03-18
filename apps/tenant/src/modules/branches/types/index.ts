export interface Branch {
  id: string
  tenantId: string
  name: string
  address?: string
  phone?: string
  timezone: string
  isActive: boolean
  createdAt: string
  weeklySchedule: ScheduleEntry[]
}

export interface ScheduleEntry {
  dayOfWeek: string
  isOpen: boolean
  openTime?: string
  closeTime?: string
}

export interface ScheduleException {
  id: string
  date: string
  isOpen: boolean
  openTime?: string
  closeTime?: string
  reason: string
}

export interface CreateBranchPayload {
  name: string
  address?: string
  phone?: string
  timezone: string
}

export interface UpdateBranchPayload extends CreateBranchPayload {
  isActive: boolean
}

export const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
] as const

export const DAYS_LABELS: Record<string, string> = {
  Monday: 'Lunes',
  Tuesday: 'Martes',
  Wednesday: 'Miércoles',
  Thursday: 'Jueves',
  Friday: 'Viernes',
  Saturday: 'Sábado',
  Sunday: 'Domingo',
}
