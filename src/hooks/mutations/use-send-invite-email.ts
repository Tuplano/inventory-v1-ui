import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

export function useSendInviteEmail() {
  return useMutation({
    mutationFn: ({ inviteId, token }: { inviteId: string; token: string }) =>
      apiClient.post(`/invites/${inviteId}/send-email`, { token }),
    onSuccess: () => toast.success('Invite email sent'),
    onError: (error) => toast.error(error.message),
  })
}
