import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'
import type { CategoryRecord } from '@/entities/categories.config'
import type { ProductRecord, ProductRow } from '@/entities/products.config'

export function useProducts() {
  const { companyId, branchId } = useScopeStore()
  return useQuery({
    queryKey: ['products', companyId, branchId],
    queryFn: async (): Promise<ProductRow[]> => {
      const [{ data: products }, categories] = await Promise.all([
        apiClient.get<ProductRecord[]>('/products'),
        apiClient
          .get<CategoryRecord[]>('/categories')
          .then((res) => res.data)
          .catch(() => [] as CategoryRecord[]),
      ])
      return products.map((p) => ({
        ...p,
        categoryName: categories.find((c) => c.id === p.categoryId)?.name,
      }))
    },
    enabled: !!companyId,
  })
}
