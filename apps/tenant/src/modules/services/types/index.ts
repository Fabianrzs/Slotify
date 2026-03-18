export interface Service {
  id: string
  tenantId: string
  categoryId?: string
  categoryName?: string
  name: string
  description?: string
  durationMinutes: number
  price: number
  currency: string
  maxCapacity: number
  isActive: boolean
  createdAt: string
}

export interface ServiceCategory {
  id: string
  tenantId: string
  name: string
  description?: string
  sortOrder: number
}

export interface CreateServicePayload {
  name: string
  durationMinutes: number
  price: number
  currency: string
  maxCapacity: number
  description?: string
  categoryId?: string
}

export interface UpdateServicePayload extends CreateServicePayload {}
