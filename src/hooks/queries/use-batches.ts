import { useInfiniteQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { fetchPage } from '@/hooks/queries/paged'
import { useScopeStore } from '@/stores/scope-store'
import { batchStatus, type BatchRecord, type BatchRow } from '@/entities/batches.config'
import type { ProductRecord } from '@/entities/products.config'
import type { PurchaseOrderRecord } from './use-purchase-orders'

export function useBatches() {
  const companyId = useScopeStore((s) => s.companyId)
  return useInfiniteQuery({
    queryKey: ['batches', companyId],
    queryFn: async ({ pageParam }): Promise<{ items: BatchRow[]; nextCursor: string | null }> => {
      const [page, { data: products }, { data: purchaseOrders }] = await Promise.all([
        fetchPage<BatchRecord>('/batches', pageParam),
        apiClient.get<ProductRecord[]>('/products'),
        apiClient.get<PurchaseOrderRecord[]>('/purchase-orders'),
      ])
      const items = page.items.map((b) => {
        const product = products.find((p) => p.id === b.productId)
        const purchaseOrder = purchaseOrders.find((po) => po.id === b.purchaseOrderId)
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
          code: product?.sku ?? '',
          name: product?.name ?? '',
          purchaseOrderNumber: purchaseOrder?.poNumber ?? null,
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
