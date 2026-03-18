export type BookingStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'NoShow'

export interface Booking {
  id: string
  tenantId: string
  branchId: string
  serviceId: string
  serviceName: string
  clientId: string
  startAt: string
  endAt: string
  status: BookingStatus
  totalPrice: number
  currency: string
  notes?: string
  createdAt: string
}

export interface BookingDetail extends Booking {
  statusHistory: StatusChange[]
  client: {
    id: string
    fullName: string
    email: string
    phone?: string
  }
}

export interface StatusChange {
  status: BookingStatus
  changedByUserId: string
  reason: string
  changedAt: string
}

export interface CreateBookingPayload {
  serviceId: string
  branchId: string
  startAt: string
  notes?: string
}

export interface BookingFilters {
  page?: number
  pageSize?: number
  branchId?: string
  serviceId?: string
  status?: BookingStatus
  dateFrom?: string
  dateTo?: string
  clientSearch?: string
}
