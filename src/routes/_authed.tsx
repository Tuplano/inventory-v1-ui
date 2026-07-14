import { useEffect } from 'react'
import { Outlet, createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { AppShell } from '@/components/app-shell/AppShell'

export const Route = createFileRoute('/_authed')({
  beforeLoad: () => {
    if (!useAuthStore.getState().authed) {
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
