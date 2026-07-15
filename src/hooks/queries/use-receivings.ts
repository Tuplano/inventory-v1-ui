import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'
import type { ReceivingRow } from '@/entities/receivings.config'
import type { PurchaseOrderRecord } from './use-purchase-orders'
import type { SupplierRecord } from '@/entities/suppliers.config'
import type { ProductRecord } from '@/entities/products.config'
import type { UomRecord } from '@/entities/uom.config'

export interface ReceivingLineRecord {
  id: string
  receivingId: string
  purchaseOrderLineId: string
  productId: string
  uomId: string
  /** Serialized as a string on the wire (Prisma Decimal → JSON). */
  receivedQty: string
  unitCost: string
  batchId: string | null
  toLocationId: string | null
  createdAt: string
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

export function useReceivings() {
  const { companyId, branchId } = useScopeStore()
  return useQuery({
    queryKey: ['receivings', branchId],
    queryFn: async (): Promise<ReceivingRow[]> => {
      const [{ data: receivings }, { data: purchaseOrders }, { data: suppliers }, { data: products }, { data: uoms }] =
        await Promise.all([
          apiClient.get<ReceivingRecord[]>('/receivings'),
          apiClient.get<PurchaseOrderRecord[]>('/purchase-orders'),
          apiClient.get<SupplierRecord[]>('/suppliers'),
          apiClient.get<ProductRecord[]>('/products'),
          apiClient.get<UomRecord[]>('/uom'),
        ])
      const productCode = (productId: string) => products.find((p) => p.id === productId)?.sku ?? productId
      const uomAbbr = (uomId: string) => uoms.find((u) => u.id === uomId)?.abbreviation ?? ''

      return receivings
        .filter((r) => r.branchId === branchId)
        .map((r) => {
          const po = purchaseOrders.find((p) => p.id === r.purchaseOrderId)
          return {
            id: r.id,
            number: r.receivingNumber,
            poId: r.purchaseOrderId,
            poNumber: po?.poNumber ?? '',
            supplierName: suppliers.find((s) => s.id === po?.supplierId)?.name ?? '',
            ref: r.referenceNumber ?? '—',
            date: r.receivedDate.slice(0, 10),
            by: r.createdById ?? '—',
            lineCount: r.lines.length,
            units: r.lines.reduce((a, l) => a + Number(l.receivedQty), 0),
            value: r.lines.reduce((a, l) => a + Number(l.receivedQty) * Number(l.unitCost), 0),
            lines: r.lines.map((l) => ({
              id: l.id,
              purchaseOrderLineId: l.purchaseOrderLineId,
              productId: l.productId,
              qty: Number(l.receivedQty),
              uom: uomAbbr(l.uomId),
              toLoc: l.toLocationId ?? '—',
            })),
            productCode,
          }
        })
    },
    enabled: !!companyId,
  })
}
