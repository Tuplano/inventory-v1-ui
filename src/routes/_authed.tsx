import { useEffect } from 'react'
import { Outlet, createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { AppShell } from '@/components/app-shell/AppShell'

export const Route = createFileRoute('/_authed')({
  beforeLoad: () => {
    // The auth store persists to localStorage, which isn't available during
    // SSR, so `authed` is always false on the server. Redirecting on that
    // would bounce authenticated users to /login on every hard refresh.
    // Defer the real check to the client-side bootstrap() below, which
    // verifies the session against the server via the auth cookie.
    if (typeof window !== 'undefined' && !useAuthStore.getState().authed) {
      throw redirect({ to: '/login' })
    }
  },
  component: AuthedLayout,
})

function AuthedLayout() {
  const navigate = useNavigate()

  useEffect(() => {
    useAuthStore.getState().bootstrap().then(() => {
      if (!useAuthStore.getState().authed) {
        navigate({ to: '/login' })
      }
    })
  }, [navigate])

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
