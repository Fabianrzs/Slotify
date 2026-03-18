'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { staffRepository } from '../repositories/staff.repository'
import type { InviteStaffPayload, UpdateStaffRolePayload } from '../types'

const STAFF_KEY = 'staff'

export function useGetStaff() {
  return useQuery({
    queryKey: [STAFF_KEY],
    queryFn: () => staffRepository.getAll(),
    staleTime: 60_000,
  })
}

export function useInviteStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: InviteStaffPayload) => staffRepository.invite(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [STAFF_KEY] }),
  })
}

export function useUpdateStaffRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateStaffRolePayload & { id: string }) =>
      staffRepository.updateRole(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [STAFF_KEY] }),
  })
}
