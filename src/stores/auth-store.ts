import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'

export interface SessionUser {
  id: string
  name: string
  email: string
  role: string
}

interface AuthState {
  authed: boolean
  user: SessionUser | null
  login: (email: string, password: string) => Promise<void>
  acceptInvite: (token: string, name: string, password: string) => Promise<void>
  logout: () => Promise<void>
  bootstrap: () => Promise<void>
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      authed: false,
      user: null,
      login: async (email, password) => {
        const { data: user } = await apiClient.post<SessionUser>('/auth/login', { email, password })
        useScopeStore.getState().resetScope()
        set({ authed: true, user })
      },
      acceptInvite: async (token, name, password) => {
        const { data: user } = await apiClient.post<SessionUser>(`/invites/token/${token}/accept`, { name, password })
        useScopeStore.getState().resetScope()
        set({ authed: true, user })
      },
      logout: async () => {
        try {
          await apiClient.post('/auth/logout')
        } finally {
          set({ authed: false, user: null })
        }
      },
      bootstrap: async () => {
        try {
          const { data: user } = await apiClient.get<SessionUser>('/auth/me')
          set({ authed: true, user })
        } catch {
          set({ authed: false, user: null })
        }
      },
      clearSession: () => set({ authed: false, user: null }),
    }),
    { name: 'palletyx-auth' },
  ),
)
