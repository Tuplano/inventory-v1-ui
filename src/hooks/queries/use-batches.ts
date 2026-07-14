import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'
import { batchStatus, type BatchRecord, type BatchRow } from '@/entities/batches.config'
import type { ProductRecord } from '@/entities/products.config'

export function useBatches() {
  const companyId = useScopeStore((s) => s.companyId)
  return useQuery({
    queryKey: ['batches', companyId],
    queryFn: async (): Promise<BatchRow[]> => {
      const [{ data: batches }, { data: products }] = await Promise.all([
        apiClient.get<BatchRecord[]>('/batches'),
        apiClient.get<ProductRecord[]>('/products'),
      ])
      return batches.map((b) => {
        const product = products.find((p) => p.id === b.productId)
        const initialQty = Number(b.initialQty)
        const remainingQty = Number(b.remainingQty)
        const { status, daysLeft } = batchStatus(remainingQty, b.expiryDate)
        return {
          id: b.id,
          companyId: b.companyId,
          productId: b.productId,
          supplierId: b.supplierId,
          batchNumber: b.batchNumber,
          lotNumber: b.lotNumber,
          manufacturingDate: b.manufacturingDate,
          expiryDate: b.expiryDate,
          initialQty,
          remainingQty,
          isActive: b.isActive,
          createdAt: b.createdAt,
          code: product?.code ?? '',
          name: product?.name ?? '',
          status,
          daysLeft,
        }
      })
    },
    enabled: !!companyId,
  })
}
