import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export interface InviteDetails {
  email: string
  companyName: string
  branchLabel: string
  roleName: string
  existingAccount: boolean
}

export function useInviteDetails(token: string) {
  return useQuery({
    queryKey: ['invite-details', token],
    queryFn: async (): Promise<InviteDetails> => {
      const { data } = await apiClient.get<InviteDetails>(`/invites/token/${token}`)
      return data
    },
    enabled: !!token,
    retry: false,
  })
}
