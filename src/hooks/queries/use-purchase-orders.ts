import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'
import type { PurchaseOrderRow } from '@/entities/purchase-orders.config'
import type { PoStatus } from '@/entities/types'
import type { SupplierRecord } from '@/entities/suppliers.config'

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
}

export function usePurchaseOrders() {
  const { companyId, branchId } = useScopeStore()
  return useQuery({
    queryKey: ['purchase-orders', branchId],
    queryFn: async (): Promise<PurchaseOrderRow[]> => {
      const [{ data: pos }, { data: suppliers }] = await Promise.all([
        apiClient.get<PurchaseOrderRecord[]>('/purchase-orders'),
        apiClient.get<SupplierRecord[]>('/suppliers'),
      ])
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
            supplierName: suppliers.find((s) => s.id === p.supplierId)?.name ?? '',
            lineCount: p.lines.length,
            value,
            progress: ordered ? Math.round((received / ordered) * 100) : 0,
          }
        })
    },
    enabled: !!companyId,
  })
}
