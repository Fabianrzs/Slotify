import { getSession } from '@/lib/auth/cognito'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

async function getHeaders(): Promise<HeadersInit> {
  const session = await getSession()
  const headers: HeadersInit = { 'Content-Type': 'application/json' }

  if (session?.accessToken) {
    headers['Authorization'] = `Bearer ${session.accessToken}`
  }

  // Tenant slug from env (each tenant app is deployed on its own subdomain)
  const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG
  if (tenantSlug) {
    headers['X-Tenant-Slug'] = tenantSlug
  }

  return headers
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = await getHeaders()
  const res = await fetch(`${API_URL}${path}`, { ...init, headers })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new ApiError(res.status, error.code ?? 'UNKNOWN', error.message ?? 'Request failed', error.errors)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

export const http = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly errors?: Record<string, string[]>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
