import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { mockStore } from '@/mock'
import { useScopeStore } from '@/stores/scope-store'
import type { CompanyRow } from '@/entities/companies.config'

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

/** @deprecated Phase-2 companies management page still runs on mock data — not yet wired to the real API. */
export function useCompanyRows() {
  return useQuery({
    queryKey: ['companies', 'rows'],
    queryFn: async (): Promise<CompanyRow[]> => {
      const [companies, branches] = await Promise.all([mockStore.listCompanies(), mockStore.listBranches()])
      return companies.map((c) => {
        const companyBranches = branches.filter((b) => b.companyId === c.id)
        return { ...c, branchCount: companyBranches.length, companyBranches }
      })
    },
  })
}
