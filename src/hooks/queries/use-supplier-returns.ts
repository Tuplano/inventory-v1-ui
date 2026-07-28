import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'
import type { SupplierReturnRow } from '@/entities/supplier-returns.config'
import type { PurchaseOrderRecord } from './use-purchase-orders'
import type { SupplierRecord } from '@/entities/suppliers.config'
import type { ProductRecord } from '@/entities/products.config'
import type { UomRecord } from '@/entities/uom.config'
import type { UserRecord } from '@/entities/users.config'
import type { ProductLocationRecord } from '@/entities/locations.config'

export interface SupplierReturnLineRecord {
  id: string
  supplierReturnId: string
  receivingLineId: string
  productId: string
  uomId: string
  /** Serialized as a string on the wire (Prisma Decimal → JSON). */
  quantity: string
  unitCost: string
  batchId: string | null
  fromLocationId: string
  serialNumberId: string | null
  createdAt: string
}

export interface SupplierReturnRecord {
  id: string
  companyId: string
  branchId: string
  supplierId: string
  purchaseOrderId: string
  returnNumber: string
  referenceNumber: string | null
  reason: string | null
  returnDate: string
  notes: string | null
  createdById: string | null
  createdAt: string
  updatedAt: string
  lines: SupplierReturnLineRecord[]
}

interface SupplierReturnsPage {
  items: SupplierReturnRecord[]
  nextCursor: string | null
}

export interface UseSupplierReturnsParams {
  q?: string
  cursor?: string
  limit?: number
}

export interface SupplierReturnsResult {
  rows: SupplierReturnRow[]
  nextCursor: string | null
}

export function useSupplierReturns(params: UseSupplierReturnsParams = {}) {
  const { companyId, branchId } = useScopeStore()
  const { q, cursor, limit = 25 } = params

  return useQuery({
    queryKey: ['supplier-returns', companyId, branchId, q, cursor, limit],
    queryFn: async (): Promise<SupplierReturnsResult> => {
      const [{ data: page }, { data: purchaseOrders }, { data: suppliers }, { data: products }, { data: uoms }, { data: users }, { data: locations }] =
        await Promise.all([
          apiClient.get<SupplierReturnsPage>('/supplier-returns', { params: { branchId, q: q || undefined, cursor, limit } }),
          apiClient.get<PurchaseOrderRecord[]>('/purchase-orders'),
          apiClient.get<SupplierRecord[]>('/suppliers'),
          apiClient.get<ProductRecord[]>('/products'),
          apiClient.get<UomRecord[]>('/uom'),
          // Both of these are permission-gated (users.view / product-locations.view) separately
          // from supplier-returns itself — fall back to an empty lookup table (and thus the raw
          // ID) rather than failing the whole page for a viewer who can post returns but can't
          // browse the users or locations lists.
          apiClient.get<UserRecord[]>('/users').catch(() => ({ data: [] as UserRecord[] })),
          apiClient.get<ProductLocationRecord[]>('/product-locations').catch(() => ({ data: [] as ProductLocationRecord[] })),
        ])
      const productCode = (productId: string) => products.find((p) => p.id === productId)?.sku ?? productId
      const uomAbbr = (uomId: string) => uoms.find((u) => u.id === uomId)?.abbreviation ?? ''
      const userName = (userId: string | null) => (userId ? (users.find((u) => u.id === userId)?.name ?? userId) : '—')
      const locationLabel = (locationId: string) => locations.find((l) => l.id === locationId)?.code ?? locationId

      const rows = page.items.map((r) => {
        const po = purchaseOrders.find((p) => p.id === r.purchaseOrderId)
        return {
          id: r.id,
          number: r.returnNumber,
          poId: r.purchaseOrderId,
          poNumber: po?.poNumber ?? '',
          supplierName: suppliers.find((s) => s.id === po?.supplierId)?.name ?? '',
          ref: r.referenceNumber ?? '—',
          reason: r.reason ?? '—',
          date: r.returnDate.slice(0, 10),
          by: userName(r.createdById),
          lineCount: r.lines.length,
          units: r.lines.reduce((a, l) => a + Number(l.quantity), 0),
          value: r.lines.reduce((a, l) => a + Number(l.quantity) * Number(l.unitCost), 0),
          lines: r.lines.map((l) => ({
            id: l.id,
            receivingLineId: l.receivingLineId,
            productId: l.productId,
            qty: Number(l.quantity),
            uom: uomAbbr(l.uomId),
            fromLoc: locationLabel(l.fromLocationId),
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
