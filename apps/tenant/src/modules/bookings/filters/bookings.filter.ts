import type { BookingFilters } from '../types'

export function buildBookingsQueryParams(filters: BookingFilters): URLSearchParams {
  const params = new URLSearchParams()

  if (filters.page) params.set('page', String(filters.page))
  if (filters.pageSize) params.set('pageSize', String(filters.pageSize))
  if (filters.branchId) params.set('branchId', filters.branchId)
  if (filters.serviceId) params.set('serviceId', filters.serviceId)
  if (filters.status) params.set('status', filters.status)
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.set('dateTo', filters.dateTo)
  if (filters.clientSearch) params.set('clientSearch', filters.clientSearch)

  return params
}

export function getDefaultFilters(): BookingFilters {
  return {
    page: 1,
    pageSize: 20,
  }
}
