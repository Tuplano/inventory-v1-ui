import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'

export interface InviteRow {
  id: string
  companyId: string
  branchId: string | null
  hasAllBranches: boolean
  roleId: string
  email: string
  invitedById: string
  expiresAt: string
  acceptedAt: string | null
  revokedAt: string | null
  createdAt: string
  roleName: string
  branchName: string | null
}

export function useInvites() {
  const { companyId } = useScopeStore()
  return useQuery({
    queryKey: ['invites', companyId],
    queryFn: async (): Promise<InviteRow[]> => {
      const { data } = await apiClient.get<InviteRow[]>('/invites')
      return data
    },
    enabled: !!companyId,
  })
}
