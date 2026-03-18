'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { settingsRepository } from '../repositories/settings.repository'
import type { UpdateSettingsPayload } from '../types'

const SETTINGS_KEY = 'tenant-settings'

export function useGetSettings() {
  return useQuery({
    queryKey: [SETTINGS_KEY],
    queryFn: () => settingsRepository.get(),
    staleTime: 300_000,
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateSettingsPayload) => settingsRepository.update(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [SETTINGS_KEY] }),
  })
}
