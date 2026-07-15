import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'
import { daysUntil } from '@/lib/format'
import type { PoStatus } from '@/entities/types'
import type { ProductRecord } from '@/entities/products.config'
import type { InventoryItemRecord } from '@/entities/inventory.config'
import type { BatchRecord } from '@/entities/batches.config'
import type { StockMovementRecord } from '@/entities/movements.config'
import type { CategoryRecord } from '@/entities/categories.config'
import type { PurchaseOrderRecord } from './use-purchase-orders'
import type { CompanyRecord } from './use-companies'

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
      const [companies, products, categories, inventory, batches, purchaseOrders, movements] = await Promise.all([
        apiClient.get<CompanyRecord[]>('/companies').then((res) => res.data),
        apiClient.get<ProductRecord[]>('/products').then((res) => res.data),
        apiClient
          .get<CategoryRecord[]>('/categories')
          .then((res) => res.data)
          .catch(() => [] as CategoryRecord[]),
        apiClient.get<InventoryItemRecord[]>('/inventory-items').then((res) => res.data),
        apiClient.get<BatchRecord[]>('/batches').then((res) => res.data),
        apiClient.get<PurchaseOrderRecord[]>('/purchase-orders').then((res) => res.data),
        apiClient.get<StockMovementRecord[]>('/stock-movements').then((res) => res.data),
      ])

      const branchInventory = inventory.filter((i) => i.branchId === branchId)
      const branchPos = purchaseOrders.filter((p) => p.branchId === branchId)
      const branchMovements = movements.filter((m) => m.branchId === branchId)
      const company = companies.find((c) => c.id === companyId)

      const lowStockItems = branchInventory.filter((i) => {
        const qty = Number(i.quantity)
        const min = i.minStockLevel != null ? Number(i.minStockLevel) : null
        return qty <= 0 || (min != null && qty < min)
      })
      const openPos = branchPos.filter((p) => p.status === 'CONFIRMED' || p.status === 'PARTIAL_RECEIVED')
      const openValue = openPos.reduce(
        (a, p) => a + p.lines.reduce((b, l) => b + (Number(l.orderedQty) - Number(l.receivedQty)) * Number(l.unitCost), 0),
        0,
      )
      const expSoonCount = batches.filter((b) => Number(b.remainingQty) > 0 && b.expiryDate && daysUntil(b.expiryDate) <= 60).length

      const kpis: DashboardKpi[] = [
        { label: 'Active SKUs', value: products.length.toLocaleString(), delta: '', deltaTone: 'neutral', sub: `in ${company?.code ?? ''}` },
        { label: 'Low / out of stock', value: lowStockItems.length.toLocaleString(), delta: lowStockItems.length > 4 ? '▲' : '—', deltaTone: 'red', sub: 'below min level' },
        { label: 'Open PO value', value: `$${openValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, delta: `${openPos.length} open`, deltaTone: 'neutral', sub: 'awaiting receipt' },
        { label: 'Expiring ≤60d', value: expSoonCount.toLocaleString(), delta: expSoonCount > 0 ? '▲' : '—', deltaTone: 'amber', sub: 'batches to review' },
      ]

      const movementDays: MovementDay[] = Array.from({ length: 14 }, (_, i) => {
        const offset = 13 - i
        const d = new Date()
        d.setDate(d.getDate() - offset)
        const dateStr = d.toISOString().slice(0, 10)
        const dayMovements = branchMovements.filter((m) => m.createdAt.slice(0, 10) === dateStr)
        const received = dayMovements.filter((m) => m.type === 'RECEIVING').reduce((a, m) => a + Number(m.quantity), 0)
        const issued = dayMovements.filter((m) => m.type === 'ISSUE').reduce((a, m) => a + Math.abs(Number(m.quantity)), 0)
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
        const categoryName = categories.find((c) => c.id === product.categoryId)?.name ?? 'Uncategorized'
        catAgg.set(categoryName, (catAgg.get(categoryName) ?? 0) + Number(i.quantity))
      })
      const maxCat = Math.max(1, ...catAgg.values())
      const categoryBars: CategoryBar[] = [...catAgg.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([label, value], i) => ({ label, value, pct: Math.round((value / maxCat) * 100), color: CATEGORY_PALETTE[i % CATEGORY_PALETTE.length] }))

      const lowStock: LowStockRow[] = lowStockItems
        .slice()
        .sort((a, b) => {
          const minA = a.minStockLevel != null ? Number(a.minStockLevel) : 1
          const minB = b.minStockLevel != null ? Number(b.minStockLevel) : 1
          return Number(a.quantity) / minA - Number(b.quantity) / minB
        })
        .slice(0, 5)
        .map((i) => {
          const product = products.find((p) => p.id === i.productId)
          return { name: product?.name ?? '', code: product?.sku ?? '', qty: Number(i.quantity), min: i.minStockLevel != null ? Number(i.minStockLevel) : 0, out: Number(i.quantity) <= 0 }
        })

      const expiringBatches: ExpiringBatchRow[] = batches
        .filter((b) => Number(b.remainingQty) > 0 && b.expiryDate && daysUntil(b.expiryDate) <= 90)
        .sort((a, b) => daysUntil(a.expiryDate as string) - daysUntil(b.expiryDate as string))
        .slice(0, 5)
        .map((b) => {
          const product = products.find((p) => p.id === b.productId)
          const d = daysUntil(b.expiryDate as string)
          return { name: product?.name ?? '', batchNo: b.batchNumber, daysLeft: d, expired: d < 0 }
        })

      return { kpis, movementDays, poStatusSlices: poCounts, categoryBars, lowStock, expiringBatches }
    },
    enabled: !!companyId && !!branchId,
  })
}
