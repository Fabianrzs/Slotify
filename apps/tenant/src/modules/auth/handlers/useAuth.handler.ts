'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  cognitoSignIn,
  cognitoSignOut,
  cognitoResetPassword,
  cognitoConfirmResetPassword,
  getCurrentUserInfo,
  getSession,
} from '@/lib/auth/cognito'
import { http } from '@/lib/http/client'
import type { LoginSchema, RegisterTenantSchema } from '../validations/auth.validation'

const SESSION_KEY = ['auth', 'session']

// ─── Session ─────────────────────────────────────────────────────────────────

export function useSession() {
  return useQuery({
    queryKey: SESSION_KEY,
    queryFn: getSession,
    staleTime: 60_000,
    retry: false,
  })
}

// ─── Login ────────────────────────────────────────────────────────────────────

export function useLogin() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async ({ email, password }: LoginSchema) => {
      const output = await cognitoSignIn(email, password)

      if (output.isSignedIn) {
        // Sync with our backend to get the local user profile
        const session = await getSession()
        if (!session) throw new Error('Failed to get session after login')
        return session
      }

      throw new Error('Login incomplete. Check if MFA or confirmation is required.')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSION_KEY })
      router.push('/dashboard')
    },
  })
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export function useLogout() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async () => {
      const session = await getSession()
      if (session?.accessToken) {
        // Also invalidate on our backend
        await http.post('/api/auth/logout', {}).catch(() => {})
      }
      await cognitoSignOut()
    },
    onSuccess: () => {
      queryClient.clear()
      router.push('/login')
    },
  })
}

// ─── Register Tenant ──────────────────────────────────────────────────────────

export function useRegisterTenant() {
  const router = useRouter()

  return useMutation({
    mutationFn: async (data: RegisterTenantSchema) => {
      return http.post<{ tenantId: string; slug: string }>('/api/onboarding/register-tenant', {
        businessName: data.businessName,
        slug: data.slug,
        ownerEmail: data.ownerEmail,
        ownerPassword: data.ownerPassword,
        ownerFullName: data.ownerFullName,
        ownerPhone: data.ownerPhone || undefined,
        timezone: data.timezone,
      })
    },
    onSuccess: (result) => {
      // Redirect to the tenant's dashboard on its subdomain
      window.location.href = `https://${result.slug}.slotify.com/dashboard`
    },
  })
}

// ─── Forgot / Reset password ─────────────────────────────────────────────────

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => cognitoResetPassword(email),
  })
}

export function useResetPassword() {
  const router = useRouter()

  return useMutation({
    mutationFn: ({ email, code, newPassword }: { email: string; code: string; newPassword: string }) =>
      cognitoConfirmResetPassword(email, code, newPassword),
    onSuccess: () => router.push('/login?reset=success'),
  })
}

// ─── Check slug availability ──────────────────────────────────────────────────

export function useCheckSlug(slug: string, enabled: boolean) {
  return useQuery({
    queryKey: ['slug-check', slug],
    queryFn: () => http.get<{ available: boolean }>(`/api/onboarding/check-slug?slug=${slug}`),
    enabled: enabled && slug.length >= 4,
    staleTime: 5_000,
  })
}
