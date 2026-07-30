import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchPage } from '@/hooks/queries/paged'
import { useScopeStore } from '@/stores/scope-store'
import type { BomRow } from '@/entities/boms.config'

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
  /** Display join embedded by the API. */
  product: { name: string; sku: string }
}

export function useBoms() {
  const companyId = useScopeStore((s) => s.companyId)
  return useInfiniteQuery({
    queryKey: ['boms', companyId],
    queryFn: async ({ pageParam }): Promise<{ items: BomRow[]; nextCursor: string | null }> => {
      const page = await fetchPage<BomRecord>('/boms', pageParam)
      const items = page.items.map((b) => {
        return {
          id: b.id,
          productId: b.productId,
          productName: b.product.name,
          productSku: b.product.sku,
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
