import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { poStatusTone } from '@/lib/tone'
import type { PoStatus, TrackingMode, Tone } from '@/entities/types'
import type { PurchaseOrderRecord } from './use-purchase-orders'
import type { ReceivingRecord } from './use-receivings'
import type { SupplierReturnRecord } from './use-supplier-returns'
import type { SupplierRecord } from '@/entities/suppliers.config'
import type { ProductRecord } from '@/entities/products.config'
import type { UomRecord } from '@/entities/uom.config'
import type { UserRecord } from '@/entities/users.config'

export interface PoLineDetail {
  id: string
  productId: string
  name: string
  code: string
  track: TrackingMode
  uom: string
  ordered: number
  received: number
  cost: number
  total: number
  pct: number
  isClosed: boolean
  overReceived: boolean
  canClose: boolean
}

export interface ReceivingHistoryRow {
  id: string
  number: string
  ref: string
  date: string
  by: string
  lineCount: number
  units: number
  value: number
}

export interface SupplierReturnHistoryRow {
  id: string
  number: string
  ref: string
  reason: string
  date: string
  by: string
  lineCount: number
  units: number
  value: number
}

// A receiving line still eligible to be returned to the supplier — unlike receiving, returns
// are scoped to individual receiving lines (not PO lines), since a PO line can be fulfilled by
// several receivings over time and each receipt is returned against independently.
export interface ReturnableLine {
  id: string
  receivingId: string
  receivingNumber: string
  purchaseOrderLineId: string
  productId: string
  name: string
  code: string
  track: TrackingMode
  uom: string
  uomId: string
  receivedQty: number
  returnedQty: number
  remaining: number
  unitCost: number
  batchId: string | null
}

export interface PoDetail {
  id: string
  number: string
  status: PoStatus
  statusLabel: string
  statusTone: Tone
  supplierName: string
  orderDate: string
  expected: string
  lines: PoLineDetail[]
  grandTotal: number
  summary: { label: string; value: string }[]
  receivings: ReceivingHistoryRow[]
  supplierReturns: SupplierReturnHistoryRow[]
  returnableLines: ReturnableLine[]
  canConfirm: boolean
  canReceive: boolean
  canCancel: boolean
  // No PO-status gating here (unlike canReceive) — a return is offerable whenever any receiving
  // line under this PO still has receivedQty > returnedQty, regardless of the PO's own status.
  canReturn: boolean
}

export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: ['purchase-order', id],
    queryFn: async (): Promise<PoDetail | null> => {
      const [{ data: po }, { data: suppliers }, { data: products }, { data: uoms }, { data: receivings }, { data: supplierReturns }, { data: users }] =
        await Promise.all([
          apiClient.get<PurchaseOrderRecord>(`/purchase-orders/${id}`),
          apiClient.get<SupplierRecord[]>('/suppliers'),
          apiClient.get<ProductRecord[]>('/products'),
          apiClient.get<UomRecord[]>('/uom'),
          apiClient.get<ReceivingRecord[]>('/receivings', { params: { purchaseOrderId: id } }),
          apiClient.get<SupplierReturnRecord[]>('/supplier-returns', { params: { purchaseOrderId: id } }),
          // users.view is permission-gated separately — fall back to the raw ID rather than
          // failing the whole PO page for a viewer who can receive/return but can't browse users.
          apiClient.get<UserRecord[]>('/users').catch(() => ({ data: [] as UserRecord[] })),
        ])
      if (!po) return null
      const userName = (userId: string | null) => (userId ? (users.find((u) => u.id === userId)?.name ?? userId) : '—')

      const receivable = po.status === 'CONFIRMED' || po.status === 'PARTIAL_RECEIVED'
      const ordered = po.lines.reduce((a, l) => a + Number(l.orderedQty), 0)
      const received = po.lines.reduce((a, l) => a + Number(l.receivedQty), 0)
      const grandTotal = po.lines.reduce((a, l) => a + Number(l.orderedQty) * Number(l.unitCost), 0)

      const lines: PoLineDetail[] = po.lines.map((l) => {
        const product = products.find((p) => p.id === l.productId)
        const uom = uoms.find((u) => u.id === l.uomId)
        const orderedQty = Number(l.orderedQty)
        const receivedQty = Number(l.receivedQty)
        const cost = Number(l.unitCost)
        const pct = orderedQty ? Math.round((receivedQty / orderedQty) * 100) : 0
        const overReceived = receivedQty > orderedQty
        return {
          id: l.id,
          productId: l.productId,
          name: product?.name ?? '',
          code: product?.sku ?? '',
          track: product?.trackingType ?? 'NONE',
          uom: uom?.abbreviation ?? '',
          ordered: orderedQty,
          received: receivedQty,
          cost,
          total: orderedQty * cost,
          pct,
          isClosed: l.isClosed,
          overReceived,
          canClose: receivable && receivedQty < orderedQty && !l.isClosed,
        }
      })

      const receivingRows: ReceivingHistoryRow[] = receivings.map((r) => ({
        id: r.id,
        number: r.receivingNumber,
        ref: r.referenceNumber ?? '—',
        date: r.receivedDate.slice(0, 10),
        by: userName(r.createdById),
        lineCount: r.lines.length,
        units: r.lines.reduce((a, l) => a + Number(l.receivedQty), 0),
        value: r.lines.reduce((a, l) => a + Number(l.receivedQty) * Number(l.unitCost), 0),
      }))

      const supplierReturnRows: SupplierReturnHistoryRow[] = supplierReturns.map((sr) => ({
        id: sr.id,
        number: sr.returnNumber,
        ref: sr.referenceNumber ?? '—',
        reason: sr.reason ?? '—',
        date: sr.returnDate.slice(0, 10),
        by: userName(sr.createdById),
        lineCount: sr.lines.length,
        units: sr.lines.reduce((a, l) => a + Number(l.quantity), 0),
        value: sr.lines.reduce((a, l) => a + Number(l.quantity) * Number(l.unitCost), 0),
      }))

      // Flatten every receiving's lines into the granularity a return actually operates on
      // (receiving lines, not PO lines) and compute what's still returnable on each.
      const returnableLines: ReturnableLine[] = receivings.flatMap((r) =>
        r.lines.map((l) => {
          const product = products.find((p) => p.id === l.productId)
          const uom = uoms.find((u) => u.id === l.uomId)
          const receivedQty = Number(l.receivedQty)
          const returnedQty = Number(l.returnedQty ?? 0)
          return {
            id: l.id,
            receivingId: r.id,
            receivingNumber: r.receivingNumber,
            purchaseOrderLineId: l.purchaseOrderLineId,
            productId: l.productId,
            name: product?.name ?? '',
            code: product?.sku ?? '',
            track: product?.trackingType ?? 'NONE',
            uom: uom?.abbreviation ?? '',
            uomId: l.uomId,
            receivedQty,
            returnedQty,
            remaining: Math.max(0, receivedQty - returnedQty),
            unitCost: Number(l.unitCost),
            batchId: l.batchId,
          }
        }),
      )
      const canReturn = returnableLines.some((l) => l.remaining > 0)

      return {
        id: po.id,
        number: po.poNumber,
        status: po.status,
        statusLabel: po.status.replace(/_/g, ' '),
        statusTone: poStatusTone(po.status),
        supplierName: suppliers.find((s) => s.id === po.supplierId)?.name ?? '',
        orderDate: po.createdAt.slice(0, 10),
        expected: po.expectedDate ? po.expectedDate.slice(0, 10) : '—',
        lines,
        grandTotal,
        summary: [
          { label: 'Lines', value: po.lines.length.toLocaleString() },
          { label: 'Units ordered', value: ordered.toLocaleString() },
          { label: 'Units received', value: received.toLocaleString() },
          { label: 'Order value', value: formatCurrency(grandTotal) },
        ],
        receivings: receivingRows,
        supplierReturns: supplierReturnRows,
        returnableLines,
        canConfirm: po.status === 'DRAFT',
        canReceive: receivable,
        canCancel: po.status === 'DRAFT' || po.status === 'CONFIRMED',
        canReturn,
      }
    },
    enabled: !!id,
  })
}
