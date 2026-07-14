import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'
import type { SupplierRecord } from '@/entities/suppliers.config'

export function useSuppliers() {
  const companyId = useScopeStore((s) => s.companyId)
  return useQuery({
    queryKey: ['suppliers', companyId],
    queryFn: async () => {
      const { data } = await apiClient.get<SupplierRecord[]>('/suppliers')
      return data
    },
    enabled: !!companyId,
  })
}
