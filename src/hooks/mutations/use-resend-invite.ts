import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

interface ResendInviteResult {
  emailSent: boolean
  emailError?: string
}

export function useResendInvite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (inviteId: string) => {
      const { data } = await apiClient.post<ResendInviteResult>(`/invites/${inviteId}/resend`)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invites'] })
      if (data.emailSent) {
        toast.success('Invite email resent')
      } else {
        toast.error(data.emailError ?? 'Could not send the invite email')
      }
    },
    onError: (error) => toast.error(error.message),
  })
}
