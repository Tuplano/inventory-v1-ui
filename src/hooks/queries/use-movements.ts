import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'
import type { MovementRow, StockMovementRecord } from '@/entities/movements.config'
import type { ProductRecord } from '@/entities/products.config'
import type { ProductLocationRecord } from '@/entities/locations.config'

interface BatchLite {
  id: string
  batchNumber: string
}

export function useMovements() {
  const { companyId, branchId } = useScopeStore()
  return useQuery({
    queryKey: ['movements', companyId, branchId],
    queryFn: async (): Promise<MovementRow[]> => {
      const [{ data: movements }, { data: products }, locations, batches] = await Promise.all([
        apiClient.get<StockMovementRecord[]>('/stock-movements'),
        apiClient.get<ProductRecord[]>('/products'),
        apiClient
          .get<ProductLocationRecord[]>('/product-locations')
          .then((res) => res.data)
          .catch(() => [] as ProductLocationRecord[]),
        apiClient
          .get<BatchLite[]>('/batches')
          .then((res) => res.data)
          .catch(() => [] as BatchLite[]),
      ])
      return movements.map((m) => {
        const product = products.find((p) => p.id === m.productId)
        const from = locations.find((l) => l.id === m.fromLocationId)
        const to = locations.find((l) => l.id === m.toLocationId)
        const batch = batches.find((b) => b.id === m.batchId)
        return {
          id: m.id,
          companyId: m.companyId,
          branchId: m.branchId,
          productId: m.productId,
          type: m.type,
          quantity: Number(m.quantity),
          reference: m.reference,
          notes: m.notes,
          fromLocationId: m.fromLocationId,
          toLocationId: m.toLocationId,
          batchId: m.batchId,
          serialNumberId: m.serialNumberId,
          createdAt: m.createdAt,
          code: product?.sku ?? '',
          name: product?.name ?? '',
          uom: product?.baseUom.abbreviation ?? '',
          fromLabel: from?.code ?? m.fromLocationId ?? '—',
          toLabel: to?.code ?? m.toLocationId ?? '—',
          batchLabel: batch?.batchNumber ?? '',
        }
      })
    },
    enabled: !!companyId && !!branchId,
  })
}
