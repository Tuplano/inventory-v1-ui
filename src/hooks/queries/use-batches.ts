import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'
import { batchStatus, type BatchRecord, type BatchRow } from '@/entities/batches.config'
import type { ProductRecord } from '@/entities/products.config'
import type { PurchaseOrderRecord } from './use-purchase-orders'

export function useBatches() {
  const companyId = useScopeStore((s) => s.companyId)
  return useQuery({
    queryKey: ['batches', companyId],
    queryFn: async (): Promise<BatchRow[]> => {
      const [{ data: batches }, { data: products }, { data: purchaseOrders }] = await Promise.all([
        apiClient.get<BatchRecord[]>('/batches'),
        apiClient.get<ProductRecord[]>('/products'),
        apiClient.get<PurchaseOrderRecord[]>('/purchase-orders'),
      ])
      return batches.map((b) => {
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
    },
    enabled: !!companyId,
  })
}
