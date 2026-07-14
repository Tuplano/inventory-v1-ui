import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'
import type { CompanyRow } from '@/entities/companies.config'
import type { BranchRecord } from './use-branches'

export interface CompanyRecord {
  id: string
  name: string
  code: string
  legalName: string | null
  email: string | null
  phone: string | null
  website: string | null
  logoUrl: string | null
  taxId: string | null
  mainAddressLine1: string | null
  mainAddressLine2: string | null
  city: string | null
  stateProvince: string | null
  postalCode: string | null
  country: string | null
}

export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data } = await apiClient.get<CompanyRecord[]>('/companies')
      return data
    },
  })
}

export function useCurrentCompany() {
  const companyId = useScopeStore((s) => s.companyId)
  const { data: companies = [] } = useCompanies()
  return companies.find((c) => c.id === companyId)
}

export function useCompanyRows() {
  return useQuery({
    queryKey: ['companies', 'rows'],
    queryFn: async (): Promise<CompanyRow[]> => {
      const { data: companies } = await apiClient.get<CompanyRecord[]>('/companies')

      const branchesByCompany = await Promise.all(
        companies.map((c) =>
          apiClient
            .get<BranchRecord[]>('/branches', { headers: { 'x-company-id': c.id } })
            .then((res) => res.data),
        ),
      )

      return companies.map((c, index) => {
        const companyBranches = (branchesByCompany[index] ?? []).map((b) => ({
          id: b.id,
          companyId: b.companyId,
          name: b.name,
          code: b.code,
          address: b.address ?? '',
          active: true,
        }))

        return {
          id: c.id,
          name: c.name,
          code: c.code,
          color: '',
          legal: c.legalName ?? '',
          tax: c.taxId ?? '',
          email: c.email ?? '',
          active: true,
          branchCount: companyBranches.length,
          companyBranches,
        }
      })
    },
  })
}
