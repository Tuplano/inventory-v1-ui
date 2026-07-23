import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'
import type { MovementRow, StockMovementRecord } from '@/entities/movements.config'
import type { MovementType } from '@/entities/types'
import type { ProductRecord } from '@/entities/products.config'
import type { ProductLocationRecord } from '@/entities/locations.config'

interface BatchLite {
  id: string
  batchNumber: string
}

interface MovementsPage {
  items: StockMovementRecord[]
  nextCursor: string | null
}

export interface UseMovementsParams {
  type?: MovementType[]
  direction?: 'INCREASE' | 'DECREASE'
  q?: string
  cursor?: string
  limit?: number
}

export interface MovementsResult {
  rows: MovementRow[]
  nextCursor: string | null
}

export function useMovements(params: UseMovementsParams = {}) {
  const { companyId, branchId } = useScopeStore()
  const { type, direction, q, cursor, limit = 25 } = params

  return useQuery({
    queryKey: ['movements', companyId, branchId, type, direction, q, cursor, limit],
    queryFn: async (): Promise<MovementsResult> => {
      const [{ data: page }, { data: products }, locations, batches] = await Promise.all([
        apiClient.get<MovementsPage>('/stock-movements', {
          params: { type: type?.join(','), direction, q: q || undefined, cursor, limit },
        }),
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

      const rows = page.items.map((m) => {
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
          remarks: m.remarks,
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
          createdByName: m.createdBy?.name ?? '',
        }
      })

      return { rows, nextCursor: page.nextCursor }
    },
    enabled: !!companyId && !!branchId,
    placeholderData: (prev) => prev,
  })
}
