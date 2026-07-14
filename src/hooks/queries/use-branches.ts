import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'

export interface BranchRecord {
  id: string
  companyId: string
  name: string
  code: string
  address: string | null
  isActive: boolean
}

export function useBranches() {
  const companyId = useScopeStore((s) => s.companyId)
  return useQuery({
    queryKey: ['branches', companyId],
    queryFn: async () => {
      const { data } = await apiClient.get<BranchRecord[]>('/branches')
      return data
    },
    enabled: !!companyId,
  })
}

export function useCurrentBranch() {
  const branchId = useScopeStore((s) => s.branchId)
  const { data: branches = [] } = useBranches()
  return branches.find((b) => b.id === branchId)
}
