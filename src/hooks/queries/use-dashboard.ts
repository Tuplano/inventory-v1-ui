import { useQuery } from '@tanstack/react-query'
import { mockStore } from '@/mock'
import { useScopeStore } from '@/stores/scope-store'
import { daysUntil } from '@/lib/format'
import type { PoStatus } from '@/mock/types'

export interface DashboardKpi {
  label: string
  value: string
  delta: string
  deltaTone: 'green' | 'red' | 'amber' | 'neutral'
  sub: string
}

export interface MovementDay {
  label: string
  received: number
  issued: number
}

export interface PoStatusSlice {
  status: PoStatus
  label: string
  count: number
}

export interface CategoryBar {
  label: string
  value: number
  pct: number
  color: string
}

export interface LowStockRow {
  name: string
  code: string
  qty: number
  min: number
  out: boolean
}

export interface ExpiringBatchRow {
  name: string
  batchNo: string
  daysLeft: number
  expired: boolean
}

export interface DashboardData {
  kpis: DashboardKpi[]
  movementDays: MovementDay[]
  poStatusSlices: PoStatusSlice[]
  categoryBars: CategoryBar[]
  lowStock: LowStockRow[]
  expiringBatches: ExpiringBatchRow[]
}

const TODAY = new Date('2026-07-13')

const PO_STATUS_ORDER: { status: PoStatus; label: string }[] = [
  { status: 'DRAFT', label: 'Draft' },
  { status: 'CONFIRMED', label: 'Confirmed' },
  { status: 'PARTIAL_RECEIVED', label: 'Partial' },
  { status: 'FULLY_RECEIVED', label: 'Received' },
  { status: 'CANCELLED', label: 'Cancelled' },
]

const CATEGORY_PALETTE = [
  'var(--brand-accent)',
  'var(--teal)',
  'var(--violet)',
  'var(--green)',
  'var(--amber)',
  'var(--red)',
  'var(--text-3)',
]

export function useDashboard() {
  const { companyId, branchId } = useScopeStore()
  return useQuery({
    queryKey: ['dashboard', companyId, branchId],
    queryFn: async (): Promise<DashboardData> => {
      const [products, inventory, batches, purchaseOrders, movements] = await Promise.all([
        mockStore.listProducts(),
        mockStore.listInventory(),
        mockStore.listBatches(),
        mockStore.listPurchaseOrders(),
        mockStore.listMovements(),
      ])

      const branchInventory = inventory.filter((i) => i.branchId === branchId)
      const branchBatches = batches.filter((b) => b.branchId === branchId)
      const branchPos = purchaseOrders.filter((p) => p.branchId === branchId)
      const branchMovements = movements.filter((m) => m.branchId === branchId)
      const company = mockStore.getCompany(companyId)

      const lowCount = branchInventory.filter((i) => i.qty < i.min).length
      const openPos = branchPos.filter((p) => p.status === 'CONFIRMED' || p.status === 'PARTIAL_RECEIVED')
      const openValue = openPos.reduce((a, p) => a + p.lines.reduce((b, l) => b + (l.ordered - l.received) * l.cost, 0), 0)
      const expSoonCount = branchBatches.filter((b) => b.remaining > 0 && daysUntil(b.expiry, TODAY) <= 60).length

      const kpis: DashboardKpi[] = [
        { label: 'Active SKUs', value: products.length.toLocaleString(), delta: '+2', deltaTone: 'green', sub: `in ${company?.code ?? ''}` },
        { label: 'Low / out of stock', value: lowCount.toLocaleString(), delta: lowCount > 4 ? '▲' : '—', deltaTone: 'red', sub: 'below min level' },
        { label: 'Open PO value', value: `$${openValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, delta: `${openPos.length} open`, deltaTone: 'neutral', sub: 'awaiting receipt' },
        { label: 'Expiring ≤60d', value: expSoonCount.toLocaleString(), delta: '▲', deltaTone: 'amber', sub: 'batches to review' },
      ]

      const movementDays: MovementDay[] = Array.from({ length: 14 }, (_, i) => {
        const offset = 13 - i
        const d = new Date(TODAY)
        d.setDate(d.getDate() - offset)
        const dateStr = d.toISOString().slice(0, 10)
        const dayMovements = branchMovements.filter((m) => m.date === dateStr)
        const received = dayMovements.filter((m) => m.type === 'RECEIVING').reduce((a, m) => a + m.qty, 0)
        const issued = dayMovements.filter((m) => m.type === 'ISSUE').reduce((a, m) => a + Math.abs(m.qty), 0)
        return { label: offset === 0 ? 'today' : `-${offset}d`, received, issued }
      })

      const poCounts = PO_STATUS_ORDER.map(({ status, label }) => ({
        status,
        label,
        count: branchPos.filter((p) => p.status === status).length,
      }))

      const catAgg = new Map<string, number>()
      branchInventory.forEach((i) => {
        const product = products.find((p) => p.id === i.productId)
        if (!product) return
        catAgg.set(product.cat, (catAgg.get(product.cat) ?? 0) + i.qty)
      })
      const maxCat = Math.max(1, ...catAgg.values())
      const categoryBars: CategoryBar[] = [...catAgg.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([label, value], i) => ({ label, value, pct: Math.round((value / maxCat) * 100), color: CATEGORY_PALETTE[i % CATEGORY_PALETTE.length] }))

      const lowStock: LowStockRow[] = branchInventory
        .filter((i) => i.qty < i.min)
        .sort((a, b) => a.qty / a.min - b.qty / b.min)
        .slice(0, 5)
        .map((i) => {
          const product = products.find((p) => p.id === i.productId)
          return { name: product?.name ?? '', code: product?.code ?? '', qty: i.qty, min: i.min, out: i.qty <= 0 }
        })

      const expiringBatches: ExpiringBatchRow[] = branchBatches
        .filter((b) => b.remaining > 0 && daysUntil(b.expiry, TODAY) <= 90)
        .sort((a, b) => daysUntil(a.expiry, TODAY) - daysUntil(b.expiry, TODAY))
        .slice(0, 5)
        .map((b) => {
          const product = products.find((p) => p.id === b.productId)
          const d = daysUntil(b.expiry, TODAY)
          return { name: product?.name ?? '', batchNo: b.batchNo, daysLeft: d, expired: d < 0 }
        })

      return { kpis, movementDays, poStatusSlices: poCounts, categoryBars, lowStock, expiringBatches }
    },
  })
}
