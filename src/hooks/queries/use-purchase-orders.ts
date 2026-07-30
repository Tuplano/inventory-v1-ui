import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'
import type { PurchaseOrderRow } from '@/entities/purchase-orders.config'
import type { PoStatus } from '@/entities/types'

export interface PurchaseOrderLineRecord {
  id: string
  purchaseOrderId: string
  productId: string
  uomId: string
  /** Serialized as a string on the wire (Prisma Decimal → JSON). */
  orderedQty: string
  receivedQty: string
  unitCost: string
  isClosed: boolean
  closedAt: string | null
  createdAt: string
  /** Display joins embedded by the API. */
  product: { name: string; sku: string; trackingType: 'NONE' | 'BATCH' | 'SERIAL' }
  uom: { abbreviation: string }
}

export interface PurchaseOrderRecord {
  id: string
  companyId: string
  branchId: string
  supplierId: string
  poNumber: string
  status: PoStatus
  expectedDate: string | null
  notes: string | null
  createdById: string | null
  createdAt: string
  lines: PurchaseOrderLineRecord[]
  /** Display join embedded by the API. */
  supplier: { name: string } | null
}

export function usePurchaseOrders() {
  const { companyId, branchId } = useScopeStore()
  return useQuery({
    queryKey: ['purchase-orders', branchId],
    queryFn: async (): Promise<PurchaseOrderRow[]> => {
      const { data: pos } = await apiClient.get<PurchaseOrderRecord[]>('/purchase-orders')
      return pos
        .filter((p) => p.branchId === branchId)
        .map((p) => {
          const ordered = p.lines.reduce((a, l) => a + Number(l.orderedQty), 0)
          const received = p.lines.reduce((a, l) => a + Number(l.receivedQty), 0)
          const value = p.lines.reduce((a, l) => a + Number(l.orderedQty) * Number(l.unitCost), 0)
          return {
            id: p.id,
            number: p.poNumber,
            status: p.status,
            orderDate: p.createdAt.slice(0, 10),
            supplierName: p.supplier?.name ?? '',
            lineCount: p.lines.length,
            value,
            progress: ordered ? Math.round((received / ordered) * 100) : 0,
          }
        })
    },
    enabled: !!companyId,
  })
}
