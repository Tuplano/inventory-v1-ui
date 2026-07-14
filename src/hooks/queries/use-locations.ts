import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'
import type { ProductLocationRecord } from '@/entities/locations.config'

export function useLocations() {
  const { companyId, branchId } = useScopeStore()
  return useQuery({
    queryKey: ['locations', companyId, branchId],
    queryFn: async () => {
      const { data } = await apiClient.get<ProductLocationRecord[]>('/product-locations')
      return data
    },
    enabled: !!companyId && !!branchId,
  })
}
