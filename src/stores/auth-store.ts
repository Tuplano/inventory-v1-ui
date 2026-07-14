import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SessionUser {
  name: string
  email: string
  initials: string
}

interface AuthState {
  authed: boolean
  user: SessionUser | null
  login: (email: string, _password: string) => void
  register: (name: string, email: string, _password: string) => void
  logout: () => void
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return (parts[0]?.[0] ?? '').concat(parts[1]?.[0] ?? '').toUpperCase() || 'U'
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      authed: false,
      user: null,
      login: (email) =>
        set({
          authed: true,
          user: { name: 'Dana Reyes', email, initials: 'DR' },
        }),
      register: (name, email) =>
        set({
          authed: true,
          user: { name, email, initials: initials(name) },
        }),
      logout: () => set({ authed: false, user: null }),
    }),
    { name: 'palletyx-auth' },
  ),
)
