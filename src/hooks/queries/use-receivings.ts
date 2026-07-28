import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'
import type { ReceivingRow } from '@/entities/receivings.config'
import type { PurchaseOrderRecord } from './use-purchase-orders'
import type { SupplierRecord } from '@/entities/suppliers.config'
import type { ProductRecord } from '@/entities/products.config'
import type { UomRecord } from '@/entities/uom.config'
import type { UserRecord } from '@/entities/users.config'
import type { ProductLocationRecord } from '@/entities/locations.config'

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
      const [{ data: page }, { data: purchaseOrders }, { data: suppliers }, { data: products }, { data: uoms }, { data: users }, { data: locations }] =
        await Promise.all([
          apiClient.get<ReceivingsPage>('/receivings', { params: { branchId, q: q || undefined, cursor, limit } }),
          apiClient.get<PurchaseOrderRecord[]>('/purchase-orders'),
          apiClient.get<SupplierRecord[]>('/suppliers'),
          apiClient.get<ProductRecord[]>('/products'),
          apiClient.get<UomRecord[]>('/uom'),
          // Permission-gated (users.view / product-locations.view) separately from receivings —
          // fall back to an empty lookup table (and thus the raw ID) instead of failing the whole
          // page for a viewer who can post receivings but can't browse users or locations.
          apiClient.get<UserRecord[]>('/users').catch(() => ({ data: [] as UserRecord[] })),
          apiClient.get<ProductLocationRecord[]>('/product-locations').catch(() => ({ data: [] as ProductLocationRecord[] })),
        ])
      const productCode = (productId: string) => products.find((p) => p.id === productId)?.sku ?? productId
      const uomAbbr = (uomId: string) => uoms.find((u) => u.id === uomId)?.abbreviation ?? ''
      const userName = (userId: string | null) => (userId ? (users.find((u) => u.id === userId)?.name ?? userId) : '—')
      const locationLabel = (locationId: string | null) => (locationId ? (locations.find((l) => l.id === locationId)?.code ?? locationId) : '—')

      const rows = page.items.map((r) => {
        const po = purchaseOrders.find((p) => p.id === r.purchaseOrderId)
        return {
          id: r.id,
          number: r.receivingNumber,
          poId: r.purchaseOrderId,
          poNumber: po?.poNumber ?? '',
          supplierName: suppliers.find((s) => s.id === po?.supplierId)?.name ?? '',
          ref: r.referenceNumber ?? '—',
          date: r.receivedDate.slice(0, 10),
          by: userName(r.createdById),
          lineCount: r.lines.length,
          units: r.lines.reduce((a, l) => a + Number(l.receivedQty), 0),
          value: r.lines.reduce((a, l) => a + Number(l.receivedQty) * Number(l.unitCost), 0),
          lines: r.lines.map((l) => ({
            id: l.id,
            purchaseOrderLineId: l.purchaseOrderLineId,
            productId: l.productId,
            qty: Number(l.receivedQty),
            uom: uomAbbr(l.uomId),
            toLoc: locationLabel(l.toLocationId),
          })),
          productCode,
        }
      })

      return { rows, nextCursor: page.nextCursor }
    },
    enabled: !!companyId && !!branchId,
    placeholderData: (prev) => prev,
  })
}
