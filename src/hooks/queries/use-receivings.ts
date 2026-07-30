import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'
import type { ReceivingRow } from '@/entities/receivings.config'

export interface ReceivingLineRecord {
  id: string
  receivingId: string
  purchaseOrderLineId: string
  productId: string
  uomId: string
  /** Serialized as a string on the wire (Prisma Decimal → JSON). */
  receivedQty: string
  /** Portion of `receivedQty` already sent back via a supplier return. Serialized as a string on the wire. */
  returnedQty: string
  unitCost: string
  batchId: string | null
  toLocationId: string | null
  createdAt: string
  /** Physical quantity still returnable right now (lot balance / IN_STOCK serial count) — can be
   * lower than `receivedQty - returnedQty` once stock has left this receipt another way (BOM
   * production, transfers, adjustments). Server-computed, not a serialized Decimal. */
  availableToReturn: number
  /** Display joins embedded by the API. */
  product: { sku: string; name: string; trackingType: 'NONE' | 'BATCH' | 'SERIAL' }
  uom: { abbreviation: string }
  toLocation: { code: string } | null
}

export interface ReceivingRecord {
  id: string
  companyId: string
  branchId: string
  purchaseOrderId: string
  receivingNumber: string
  referenceNumber: string | null
  receivedDate: string
  notes: string | null
  createdById: string | null
  createdAt: string
  lines: ReceivingLineRecord[]
  /** Display joins embedded by the API. */
  purchaseOrder: { poNumber: string; supplier: { name: string } | null } | null
  createdBy: { name: string } | null
}

interface ReceivingsPage {
  items: ReceivingRecord[]
  nextCursor: string | null
}

export interface UseReceivingsParams {
  q?: string
  cursor?: string
  limit?: number
}

export interface ReceivingsResult {
  rows: ReceivingRow[]
  nextCursor: string | null
}

export function useReceivings(params: UseReceivingsParams = {}) {
  const { companyId, branchId } = useScopeStore()
  const { q, cursor, limit = 25 } = params

  return useQuery({
    queryKey: ['receivings', companyId, branchId, q, cursor, limit],
    queryFn: async (): Promise<ReceivingsResult> => {
      const { data: page } = await apiClient.get<ReceivingsPage>('/receivings', {
        params: { branchId, q: q || undefined, cursor, limit },
      })

      // Product SKUs for line display come embedded per line now — expose the same lookup shape
      // the row consumers already use.
      const rows = page.items.map((r) => {
        const skuByProduct = new Map(r.lines.map((l) => [l.productId, l.product.sku]))
        return {
          id: r.id,
          number: r.receivingNumber,
          poId: r.purchaseOrderId,
          poNumber: r.purchaseOrder?.poNumber ?? '',
          supplierName: r.purchaseOrder?.supplier?.name ?? '',
          ref: r.referenceNumber ?? '—',
          date: r.receivedDate.slice(0, 10),
          by: r.createdBy?.name ?? (r.createdById ? r.createdById : '—'),
          lineCount: r.lines.length,
          units: r.lines.reduce((a, l) => a + Number(l.receivedQty), 0),
          value: r.lines.reduce((a, l) => a + Number(l.receivedQty) * Number(l.unitCost), 0),
          lines: r.lines.map((l) => ({
            id: l.id,
            purchaseOrderLineId: l.purchaseOrderLineId,
            productId: l.productId,
            qty: Number(l.receivedQty),
            uom: l.uom.abbreviation,
            toLoc: l.toLocation?.code ?? '—',
          })),
          productCode: (productId: string) => skuByProduct.get(productId) ?? productId,
        }
      })

      return { rows, nextCursor: page.nextCursor }
    },
    enabled: !!companyId && !!branchId,
    placeholderData: (prev) => prev,
  })
}
