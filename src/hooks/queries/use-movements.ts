import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'
import type { MovementRow, StockMovementRecord } from '@/entities/movements.config'
import type { MovementType } from '@/entities/types'

/** Display joins embedded by the API — no client-side lookup-table fetches needed. */
type StockMovementListItem = StockMovementRecord & {
  product: { sku: string; name: string; baseUom: { abbreviation: string } }
  fromLocation: { code: string } | null
  toLocation: { code: string } | null
  batch: { batchNumber: string } | null
}

interface MovementsPage {
  items: StockMovementListItem[]
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
      const { data: page } = await apiClient.get<MovementsPage>('/stock-movements', {
        params: { type: type?.join(','), direction, q: q || undefined, cursor, limit },
      })

      const rows = page.items.map((m) => ({
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
        code: m.product.sku,
        name: m.product.name,
        uom: m.product.baseUom.abbreviation,
        fromLabel: m.fromLocation?.code ?? m.fromLocationId ?? '—',
        toLabel: m.toLocation?.code ?? m.toLocationId ?? '—',
        batchLabel: m.batch?.batchNumber ?? '',
        createdByName: m.createdBy?.name ?? '',
      }))

      return { rows, nextCursor: page.nextCursor }
    },
    enabled: !!companyId && !!branchId,
    placeholderData: (prev) => prev,
  })
}
