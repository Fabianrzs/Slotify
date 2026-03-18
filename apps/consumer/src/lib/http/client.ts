import { getSession } from 'next-auth/react'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

async function getHeaders(tenantSlug?: string): Promise<HeadersInit> {
  const session = await getSession()
  const headers: HeadersInit = { 'Content-Type': 'application/json' }

  if (session?.accessToken) {
    headers['Authorization'] = `Bearer ${session.accessToken}`
  }

  if (tenantSlug) {
    headers['X-Tenant-Slug'] = tenantSlug
  }

  return headers
}

async function request<T>(path: string, tenantSlug?: string, init?: RequestInit): Promise<T> {
  const headers = await getHeaders(tenantSlug)
  const res = await fetch(`${API_URL}${path}`, { ...init, headers })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new ApiError(res.status, error.code ?? 'UNKNOWN', error.message ?? 'Request failed', error.errors)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

export function createHttpClient(tenantSlug: string) {
  return {
    get: <T>(path: string) => request<T>(path, tenantSlug, { method: 'GET' }),
    post: <T>(path: string, body: unknown) =>
      request<T>(path, tenantSlug, { method: 'POST', body: JSON.stringify(body) }),
    patch: <T>(path: string, body?: unknown) =>
      request<T>(path, tenantSlug, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  }
}

// For endpoints that don't require tenant context (e.g. auth)
export const http = {
  get: <T>(path: string) => request<T>(path, undefined, { method: 'GET' }),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, undefined, { method: 'POST', body: JSON.stringify(body) }),
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
