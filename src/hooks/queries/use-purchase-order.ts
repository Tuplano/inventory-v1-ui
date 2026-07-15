import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { formatCurrency } from '@/lib/format'
import { poStatusTone } from '@/lib/tone'
import type { PoStatus, TrackingMode, Tone } from '@/entities/types'
import type { PurchaseOrderRecord } from './use-purchase-orders'
import type { ReceivingRecord } from './use-receivings'
import type { SupplierRecord } from '@/entities/suppliers.config'
import type { ProductRecord } from '@/entities/products.config'
import type { UomRecord } from '@/entities/uom.config'

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
  canConfirm: boolean
  canReceive: boolean
  canCancel: boolean
}

export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: ['purchase-order', id],
    queryFn: async (): Promise<PoDetail | null> => {
      const [{ data: po }, { data: suppliers }, { data: products }, { data: uoms }, { data: receivings }] =
        await Promise.all([
          apiClient.get<PurchaseOrderRecord>(`/purchase-orders/${id}`),
          apiClient.get<SupplierRecord[]>('/suppliers'),
          apiClient.get<ProductRecord[]>('/products'),
          apiClient.get<UomRecord[]>('/uom'),
          apiClient.get<ReceivingRecord[]>('/receivings', { params: { purchaseOrderId: id } }),
        ])
      if (!po) return null

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
        by: r.createdById ?? '—',
        lineCount: r.lines.length,
        units: r.lines.reduce((a, l) => a + Number(l.receivedQty), 0),
        value: r.lines.reduce((a, l) => a + Number(l.receivedQty) * Number(l.unitCost), 0),
      }))

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
        canConfirm: po.status === 'DRAFT',
        canReceive: receivable,
        canCancel: po.status === 'DRAFT' || po.status === 'CONFIRMED',
      }
    },
    enabled: !!id,
  })
}
