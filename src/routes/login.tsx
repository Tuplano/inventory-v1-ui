import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { LoginCard } from '@/components/auth/LoginCard'

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    if (useAuthStore.getState().authed) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: LoginCard,
})
