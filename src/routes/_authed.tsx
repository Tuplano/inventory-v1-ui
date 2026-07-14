import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { AppShell } from '@/components/app-shell/AppShell'

export const Route = createFileRoute('/_authed')({
  beforeLoad: () => {
    if (!useAuthStore.getState().authed) {
      throw redirect({ to: '/login' })
    }
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
})
