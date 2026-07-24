import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'

export interface CompanyAccessGrant {
  id: string
  userId: string
  companyId: string
  hasAllBranches: boolean
  isActive: boolean
}

export interface BranchAccessGrant {
  id: string
  userId: string
  companyId: string
  branchId: string
  isActive: boolean
}

export function useCompanyAccessList(enabled = true) {
  const companyId = useScopeStore((s) => s.companyId)
  return useQuery({
    queryKey: ['company-access', companyId],
    queryFn: async () => {
      const { data } = await apiClient.get<CompanyAccessGrant[]>('/company-access')
      return data
    },
    enabled: !!companyId && enabled,
  })
}

export function useBranchAccessList(enabled = true) {
  const companyId = useScopeStore((s) => s.companyId)
  return useQuery({
    queryKey: ['company-access', 'branches', companyId],
    queryFn: async () => {
      const { data } = await apiClient.get<BranchAccessGrant[]>('/company-access/branches')
      return data
    },
    enabled: !!companyId && enabled,
  })
}
