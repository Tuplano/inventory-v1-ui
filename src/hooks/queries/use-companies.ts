import { useQuery } from '@tanstack/react-query'
import { mockStore } from '@/mock'
import type { CompanyRow } from '@/entities/companies.config'

export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: () => mockStore.listCompanies(),
  })
}

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
