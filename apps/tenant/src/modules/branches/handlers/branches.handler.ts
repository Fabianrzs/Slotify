'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { branchesRepository } from '../repositories/branches.repository'
import type { CreateBranchPayload, ScheduleEntry, UpdateBranchPayload } from '../types'

const BRANCHES_KEY = 'branches'

export function useGetBranches(activeOnly?: boolean) {
  return useQuery({
    queryKey: [BRANCHES_KEY, { activeOnly }],
    queryFn: () => branchesRepository.getAll(activeOnly),
    staleTime: 60_000,
  })
}

export function useCreateBranch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateBranchPayload) => branchesRepository.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [BRANCHES_KEY] }),
  })
}

export function useUpdateBranch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateBranchPayload & { id: string }) =>
      branchesRepository.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [BRANCHES_KEY] }),
  })
}

export function useSetBranchSchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, schedule }: { id: string; schedule: ScheduleEntry[] }) =>
      branchesRepository.setSchedule(id, schedule),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [BRANCHES_KEY] }),
  })
}

export function useAddScheduleException() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; date: string; isOpen: boolean; openTime?: string; closeTime?: string; reason: string }) =>
      branchesRepository.addException(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [BRANCHES_KEY] }),
  })
}
