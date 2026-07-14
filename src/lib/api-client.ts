import axios, { type InternalAxiosRequestConfig } from 'axios'
import { useScopeStore } from '@/stores/scope-store'
import { useAuthStore } from '@/stores/auth-store'
import { getCookie } from './cookies'

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean
  }
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

let csrfPromise: Promise<unknown> | null = null

async function ensureCsrfToken() {
  if (getCookie('csrf_token')) return
  csrfPromise ??= apiClient.get('/auth/csrf-token').finally(() => {
    csrfPromise = null
  })
  await csrfPromise
}

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const { companyId, branchId } = useScopeStore.getState()
  // Don't clobber a header the caller explicitly set (e.g. fetching data scoped
  // to a specific company regardless of the current sidebar selection).
  if (companyId && !config.headers.has('x-company-id')) config.headers.set('x-company-id', companyId)
  if (branchId && !config.headers.has('x-branch-id')) config.headers.set('x-branch-id', branchId)

  const method = (config.method ?? 'get').toLowerCase()
  const isMutating = !['get', 'head', 'options'].includes(method)
  const isCsrfEndpoint = config.url?.includes('/auth/csrf-token')

  if (isMutating && !isCsrfEndpoint) {
    await ensureCsrfToken()
    const token = getCookie('csrf_token')
    if (token) config.headers.set('x-csrf-token', token)
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => {
    const body: unknown = response.data
    if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
      return { ...response, data: (body as { data: unknown }).data }
    }
    return response
  },
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error)

    const original = error.config
    const status = error.response?.status
    const isAuthRoute = original?.url?.includes('/auth/')

    if (status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true
      try {
        await apiClient.post('/auth/refresh')
        return apiClient(original)
      } catch {
        useAuthStore.getState().clearSession()
      }
    }

    const message =
      (error.response?.data as { message?: string } | undefined)?.message ?? error.message
    return Promise.reject(new Error(message))
  },
)
