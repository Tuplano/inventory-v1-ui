import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchPage } from '@/hooks/queries/paged'
import { useScopeStore } from '@/stores/scope-store'
import { batchStatus, type BatchRecord, type BatchRow } from '@/entities/batches.config'

/** Display joins embedded by the API — no client-side lookup-table fetches needed. */
type BatchListItem = BatchRecord & {
  product: { sku: string; name: string }
  purchaseOrder: { poNumber: string } | null
}

export function useBatches() {
  const companyId = useScopeStore((s) => s.companyId)
  return useInfiniteQuery({
    queryKey: ['batches', companyId],
    queryFn: async ({ pageParam }): Promise<{ items: BatchRow[]; nextCursor: string | null }> => {
      const page = await fetchPage<BatchListItem>('/batches', pageParam)
      const items = page.items.map((b) => {
        const initialQty = Number(b.initialQty)
        const remainingQty = Number(b.remainingQty)
        const { status, daysLeft } = batchStatus(remainingQty, b.expiryDate)
        return {
          id: b.id,
          companyId: b.companyId,
          productId: b.productId,
          supplierId: b.supplierId,
          purchaseOrderId: b.purchaseOrderId,
          batchNumber: b.batchNumber,
          lotNumber: b.lotNumber,
          manufacturingDate: b.manufacturingDate,
          expiryDate: b.expiryDate,
          initialQty,
          remainingQty,
          isActive: b.isActive,
          createdAt: b.createdAt,
          code: b.product.sku,
          name: b.product.name,
          purchaseOrderNumber: b.purchaseOrder?.poNumber ?? null,
          status,
          daysLeft,
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
