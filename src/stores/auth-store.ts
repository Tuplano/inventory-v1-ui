import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '@/lib/api-client'

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
  register: (name: string, email: string, password: string) => Promise<void>
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
        set({ authed: true, user })
      },
      register: async (name, email, password) => {
        const { data: user } = await apiClient.post<SessionUser>('/auth/register', { name, email, password })
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
