import { useInfiniteQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { fetchPage } from '@/hooks/queries/paged'
import { useScopeStore } from '@/stores/scope-store'
import type { BomRow } from '@/entities/boms.config'
import type { ProductRecord } from '@/entities/products.config'

export interface BomComponentRecord {
  id: string
  bomId: string
  componentProductId: string
  /** Serialized as a string on the wire (Prisma Decimal → JSON). */
  quantity: string
  uomId: string | null
  notes: string | null
  createdAt: string
}

export interface BomRecord {
  id: string
  companyId: string
  productId: string
  name: string | null
  version: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  components: BomComponentRecord[]
}

export function useBoms() {
  const companyId = useScopeStore((s) => s.companyId)
  return useInfiniteQuery({
    queryKey: ['boms', companyId],
    queryFn: async ({ pageParam }): Promise<{ items: BomRow[]; nextCursor: string | null }> => {
      const [page, { data: products }] = await Promise.all([
        fetchPage<BomRecord>('/boms', pageParam),
        apiClient.get<ProductRecord[]>('/products'),
      ])
      const items = page.items.map((b) => {
        const product = products.find((p) => p.id === b.productId)
        return {
          id: b.id,
          productId: b.productId,
          productName: product?.name ?? '',
          productSku: product?.sku ?? '',
          name: b.name,
          version: b.version,
          isActive: b.isActive,
          componentCount: b.components.length,
          createdAt: b.createdAt.slice(0, 10),
        }
      })
      return { items, nextCursor: page.nextCursor }
    },
    initialPageParam: '',
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    select: (data) => data.pages.flatMap((p) => p.items),
    enabled: !!companyId,
  })
}
