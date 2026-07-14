import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'
import type { CategoryRecord } from '@/entities/categories.config'

export function useCategories() {
  const { companyId, branchId } = useScopeStore()
  return useQuery({
    queryKey: ['categories', companyId, branchId],
    queryFn: async () => {
      const { data } = await apiClient.get<CategoryRecord[]>('/categories')
      return data
    },
    enabled: !!companyId && !!branchId,
  })
}
