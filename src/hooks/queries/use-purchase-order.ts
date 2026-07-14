import { useQuery } from '@tanstack/react-query'
import { mockStore } from '@/mock'
import { formatCurrency } from '@/lib/format'
import { poStatusTone } from '@/lib/tone'
import type { PoStatus, TrackingMode, Tone } from '@/mock/types'

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
      const po = await mockStore.getPurchaseOrder(id)
      if (!po) return null

      const receivable = po.status === 'CONFIRMED' || po.status === 'PARTIAL_RECEIVED'
      const ordered = po.lines.reduce((a, l) => a + l.ordered, 0)
      const received = po.lines.reduce((a, l) => a + l.received, 0)
      const grandTotal = po.lines.reduce((a, l) => a + l.ordered * l.cost, 0)

      const lines: PoLineDetail[] = po.lines.map((l) => {
        const product = mockStore.getProduct(l.productId)
        const pct = l.ordered ? Math.round((l.received / l.ordered) * 100) : 0
        const overReceived = l.received > l.ordered
        return {
          id: l.id,
          productId: l.productId,
          name: product?.name ?? '',
          code: product?.code ?? '',
          track: product?.track ?? 'NONE',
          uom: l.uom,
          ordered: l.ordered,
          received: l.received,
          cost: l.cost,
          total: l.ordered * l.cost,
          pct,
          isClosed: l.isClosed,
          overReceived,
          canClose: receivable && l.received < l.ordered && !l.isClosed,
        }
      })

      const receivings: ReceivingHistoryRow[] = mockStore.receivingsForPo(po.id).map((r) => ({
        id: r.id,
        number: r.number,
        ref: r.ref,
        date: r.date,
        by: r.by,
        lineCount: r.lines.length,
        units: r.lines.reduce((a, l) => a + l.qty, 0),
        value: r.lines.reduce((a, l) => a + l.qty * l.cost, 0),
      }))

      return {
        id: po.id,
        number: po.number,
        status: po.status,
        statusLabel: po.status.replace(/_/g, ' '),
        statusTone: poStatusTone(po.status),
        supplierName: mockStore.supplierName(po.sup),
        orderDate: po.orderDate,
        expected: po.expected,
        lines,
        grandTotal,
        summary: [
          { label: 'Lines', value: po.lines.length.toLocaleString() },
          { label: 'Units ordered', value: ordered.toLocaleString() },
          { label: 'Units received', value: received.toLocaleString() },
          { label: 'Order value', value: formatCurrency(grandTotal) },
        ],
        receivings,
        canConfirm: po.status === 'DRAFT',
        canReceive: receivable,
        canCancel: po.status === 'DRAFT' || po.status === 'CONFIRMED',
      }
    },
    enabled: !!id,
  })
}
