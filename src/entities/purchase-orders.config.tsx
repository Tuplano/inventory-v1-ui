import { z } from 'zod'
import type { EntityTableConfig } from './types'
import type { PoStatus } from '@/entities/types'
import { MonoCell, StockCell, ToneBadge } from '@/components/entity-table/cells'
import { formatCurrency } from '@/lib/format'
import { poStatusTone } from '@/lib/tone'

export const createPurchaseOrderLineSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  uomId: z.string().min(1, 'UoM is required'),
  orderedQty: z.number().positive('Ordered quantity must be positive'),
  unitCost: z.number().min(0, 'Unit cost cannot be negative'),
})

export const createPurchaseOrderSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  poNumber: z.string().min(1, 'PO number is required'),
  expectedDate: z.string().optional(),
  notes: z.string().optional(),
  lines: z.array(createPurchaseOrderLineSchema).min(1, 'At least one line item is required'),
})

export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>

export interface PurchaseOrderRow {
  id: string
  number: string
  status: PoStatus
  orderDate: string
  supplierName: string
  lineCount: number
  value: number
  progress: number
}

const filterStatuses: PoStatus[] = ['DRAFT', 'CONFIRMED', 'PARTIAL_RECEIVED', 'FULLY_RECEIVED', 'CLOSED', 'CANCELLED']

export function createPurchaseOrdersConfig(branchName: string): EntityTableConfig<PurchaseOrderRow> {
  return {
    key: 'pos',
    title: 'Purchase orders',
    subtitle: `Procurement · ${branchName}`,
    primaryActionLabel: 'New PO',
    searchKeys: ['number'],
    getRowId: (row) => row.id,
    getRowHref: (row) => `/purchase-orders/${row.id}`,
    filters: [
      { key: 'all', label: 'All' },
      ...filterStatuses.map((status) => ({
        key: status,
        label: status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        predicate: (r: PurchaseOrderRow) => r.status === status,
      })),
    ],
    columns: [
      { key: 'number', header: 'PO #', sortable: true, sortValue: (r) => r.number, render: (r) => <MonoCell value={r.number} color="var(--brand-accent-d)" weight={600} /> },
      { key: 'supplierName', header: 'Supplier', render: (r) => <span className="font-medium">{r.supplierName}</span> },
      { key: 'status', header: 'Status', render: (r) => <ToneBadge tone={poStatusTone(r.status)} label={r.status.replace(/_/g, ' ')} dot /> },
      { key: 'lineCount', header: 'Lines', render: (r) => <span className="font-mono text-[12px]">{r.lineCount}</span> },
      {
        key: 'progress',
        header: 'Progress',
        render: (r) => (
          <StockCell
            value={`${Math.min(100, r.progress)}%`}
            pct={Math.min(100, r.progress)}
            tone={r.progress >= 100 ? 'green' : r.progress > 0 ? 'amber' : 'neutral'}
          />
        ),
      },
      { key: 'orderDate', header: 'Ordered', sortable: true, sortValue: (r) => r.orderDate, render: (r) => <MonoCell value={r.orderDate} color="var(--text-2)" /> },
      { key: 'value', header: 'Value', sortable: true, sortValue: (r) => r.value, render: (r) => <span className="font-mono text-[12px] font-semibold">{formatCurrency(r.value)}</span> },
    ],
  }
}
