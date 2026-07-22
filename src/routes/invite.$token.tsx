import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { AcceptInviteCard } from '@/components/auth/AcceptInviteCard'

export const Route = createFileRoute('/invite/$token')({
  beforeLoad: () => {
    if (useAuthStore.getState().authed) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: InvitePage,
})

function InvitePage() {
  const { token } = Route.useParams()
  return <AcceptInviteCard token={token} />
}
