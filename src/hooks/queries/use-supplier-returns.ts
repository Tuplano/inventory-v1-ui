import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'
import type { SupplierReturnRow } from '@/entities/supplier-returns.config'

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
  /** Display joins embedded by the API. */
  product: { sku: string }
  uom: { abbreviation: string }
  fromLocation: { code: string } | null
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
  /** Display joins embedded by the API. */
  purchaseOrder: { poNumber: string; supplier: { name: string } | null } | null
  createdBy: { name: string } | null
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
      const { data: page } = await apiClient.get<SupplierReturnsPage>('/supplier-returns', {
        params: { branchId, q: q || undefined, cursor, limit },
      })

      const rows = page.items.map((r) => {
        const skuByProduct = new Map(r.lines.map((l) => [l.productId, l.product.sku]))
        return {
          id: r.id,
          number: r.returnNumber,
          poId: r.purchaseOrderId,
          poNumber: r.purchaseOrder?.poNumber ?? '',
          supplierName: r.purchaseOrder?.supplier?.name ?? '',
          ref: r.referenceNumber ?? '—',
          reason: r.reason ?? '—',
          date: r.returnDate.slice(0, 10),
          by: r.createdBy?.name ?? (r.createdById ? r.createdById : '—'),
          lineCount: r.lines.length,
          units: r.lines.reduce((a, l) => a + Number(l.quantity), 0),
          value: r.lines.reduce((a, l) => a + Number(l.quantity) * Number(l.unitCost), 0),
          lines: r.lines.map((l) => ({
            id: l.id,
            receivingLineId: l.receivingLineId,
            productId: l.productId,
            qty: Number(l.quantity),
            uom: l.uom.abbreviation,
            fromLoc: l.fromLocation?.code ?? l.fromLocationId,
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
