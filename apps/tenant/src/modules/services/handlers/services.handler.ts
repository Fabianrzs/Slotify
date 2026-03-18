'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { servicesRepository } from '../repositories/services.repository'
import type { CreateServicePayload, UpdateServicePayload } from '../types'

const SERVICES_KEY = 'services'

export function useGetServices(params?: { activeOnly?: boolean; categoryId?: string }) {
  return useQuery({
    queryKey: [SERVICES_KEY, params],
    queryFn: () => servicesRepository.getAll(params),
    staleTime: 60_000,
  })
}

export function useCreateService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateServicePayload) => servicesRepository.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [SERVICES_KEY] }),
  })
}

export function useUpdateService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateServicePayload & { id: string }) =>
      servicesRepository.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [SERVICES_KEY] }),
  })
}

export function useToggleService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      servicesRepository.toggle(id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [SERVICES_KEY] }),
  })
}
