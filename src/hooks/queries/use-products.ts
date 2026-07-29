import { useInfiniteQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'
import type { CategoryRecord } from '@/entities/categories.config'
import type { ProductRecord, ProductRow } from '@/entities/products.config'

const PAGE_SIZE = 200

interface ProductsPage {
  items: ProductRecord[]
  nextCursor: string | null
}

/** Products load a server page (200) at a time — `data` stays a flat, append-only array so
 * existing consumers are unaffected; callers that can outgrow the first page (tables, product
 * pickers) also get `fetchNextPage`/`hasNextPage` to pull the rest on demand. */
export function useProducts() {
  const { companyId, branchId } = useScopeStore()
  return useInfiniteQuery({
    queryKey: ['products', companyId, branchId],
    queryFn: async ({ pageParam }): Promise<{ rows: ProductRow[]; nextCursor: string | null }> => {
      const [{ data: page }, categories] = await Promise.all([
        apiClient.get<ProductsPage>('/products', {
          params: { limit: PAGE_SIZE, cursor: pageParam || undefined },
        }),
        apiClient
          .get<CategoryRecord[]>('/categories')
          .then((res) => res.data)
          .catch(() => [] as CategoryRecord[]),
      ])
      return {
        rows: page.items.map((p) => ({
          ...p,
          categoryName: categories.find((c) => c.id === p.categoryId)?.name,
        })),
        nextCursor: page.nextCursor,
      }
    },
    initialPageParam: '',
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    select: (data) => data.pages.flatMap((p) => p.rows),
    enabled: !!companyId,
  })
}
