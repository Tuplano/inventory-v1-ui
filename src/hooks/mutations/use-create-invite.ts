import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

export interface CreateInviteInput {
  email: string
  roleId: string
  hasAllBranches?: boolean
  branchId?: string
  sendEmail?: boolean
}

export interface CreateInviteResult {
  invite: { id: string; email: string }
  token: string
  emailSent: boolean
  emailError?: string
}

export function useCreateInvite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateInviteInput) => {
      const { data } = await apiClient.post<CreateInviteResult>('/invites', input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites'] })
    },
    onError: (error) => toast.error(error.message),
  })
}
