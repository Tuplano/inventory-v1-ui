import { z } from 'zod'
import type { EntityTableConfig, Tone } from './types'
import { MonoCell, StockCell, SubCell, ToneBadge } from '@/components/entity-table/cells'
import { daysUntil } from '@/lib/format'

export const createBatchSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  supplierId: z.string().optional(),
  batchNumber: z.string().min(1, 'Batch number is required'),
  lotNumber: z.string().optional(),
  manufacturingDate: z.string().optional(),
  expiryDate: z.string().optional(),
  initialQty: z.number().positive('Initial quantity must be positive'),
})

export const updateBatchSchema = z.object({
  lotNumber: z.string().nullable().optional(),
  expiryDate: z.string().nullable().optional(),
  remainingQty: z.number().min(0, 'Remaining quantity cannot be negative').optional(),
  isActive: z.boolean().optional(),
})

export type CreateBatchInput = z.infer<typeof createBatchSchema>
export type UpdateBatchInput = z.infer<typeof updateBatchSchema>

/** Raw wire shape from GET /batches (Decimal fields arrive as strings). */
export interface BatchRecord {
  id: string
  companyId: string
  productId: string
  supplierId: string | null
  batchNumber: string
  lotNumber: string | null
  manufacturingDate: string | null
  expiryDate: string | null
  initialQty: string
  remainingQty: string
  isActive: boolean
  createdAt: string
}

export interface BatchRow {
  id: string
  companyId: string
  productId: string
  supplierId: string | null
  batchNumber: string
  lotNumber: string | null
  manufacturingDate: string | null
  expiryDate: string | null
  initialQty: number
  remainingQty: number
  isActive: boolean
  createdAt: string
  code: string
  name: string
  daysLeft: number | null
  status: 'expired' | 'soon' | 'ok' | 'depleted'
}

const statusMeta: Record<BatchRow['status'], { tone: Tone }> = {
  expired: { tone: 'red' },
  soon: { tone: 'amber' },
  ok: { tone: 'green' },
  depleted: { tone: 'neutral' },
}

function statusLabel(row: BatchRow) {
  if (row.status === 'expired') return 'Expired'
  if (row.status === 'soon') return `${row.daysLeft ?? 0}d left`
  if (row.status === 'depleted') return 'Depleted'
  return 'OK'
}

function fmtDate(value: string | null): string {
  return value ? value.slice(0, 10) : '—'
}

export function createBatchesConfig(branchName: string): EntityTableConfig<BatchRow> {
  return {
    key: 'batches',
    title: 'Batches',
    subtitle: `Lot tracking & expiry · ${branchName}`,
    primaryActionLabel: 'New batch',
    searchKeys: ['batchNumber', 'name'],
    getRowId: (row) => row.id,
    filters: [
      { key: 'all', label: 'All' },
      { key: 'expired', label: 'Expired', predicate: (r) => r.status === 'expired' },
      { key: 'soon', label: 'Expiring ≤60d', predicate: (r) => r.status === 'soon' },
      { key: 'ok', label: 'OK', predicate: (r) => r.status === 'ok' },
      { key: 'depleted', label: 'Depleted', predicate: (r) => r.status === 'depleted' },
    ],
    columns: [
      { key: 'batchNumber', header: 'Batch #', sortable: true, sortValue: (r) => r.batchNumber, render: (r) => <MonoCell value={r.batchNumber} weight={600} /> },
      { key: 'lotNumber', header: 'Lot', render: (r) => <MonoCell value={r.lotNumber ?? '—'} color="var(--text-2)" /> },
      { key: 'name', header: 'Product', render: (r) => <SubCell main={r.name} sub={r.code} /> },
      { key: 'manufacturingDate', header: 'Mfg', render: (r) => <MonoCell value={fmtDate(r.manufacturingDate)} color="var(--text-3)" /> },
      {
        key: 'expiryDate',
        header: 'Expiry',
        sortable: true,
        sortValue: (r) => r.expiryDate ?? '',
        render: (r) => (
          <MonoCell
            value={fmtDate(r.expiryDate)}
            weight={600}
            color={r.status === 'expired' ? 'var(--red)' : r.status === 'soon' ? 'var(--amber)' : 'var(--text-2)'}
          />
        ),
      },
      {
        key: 'remainingQty',
        header: 'Remaining',
        render: (r) => (
          <StockCell
            value={r.remainingQty.toLocaleString()}
            pct={Math.round((r.remainingQty / (r.initialQty || 1)) * 100)}
            tone={r.status === 'expired' ? 'red' : 'teal'}
          />
        ),
      },
      { key: 'status', header: 'Status', render: (r) => <ToneBadge tone={statusMeta[r.status].tone} label={statusLabel(r)} dot /> },
    ],
    drawer: (row) => ({
      title: row.name,
      subtitle: row.batchNumber,
      badge: { label: statusLabel(row), tone: statusMeta[row.status].tone },
      sections: [
        {
          label: 'Lot',
          rows: [
            { label: 'Manufactured', value: fmtDate(row.manufacturingDate) },
            { label: 'Expiry', value: fmtDate(row.expiryDate) },
            {
              label: 'Days to expiry',
              value: row.daysLeft == null ? '—' : row.daysLeft < 0 ? `expired ${-row.daysLeft}d ago` : `${row.daysLeft}d`,
            },
            { label: 'Remaining', value: row.remainingQty.toLocaleString() },
          ],
        },
      ],
    }),
  }
}

export function batchStatus(
  remainingQty: number,
  expiryDate: string | null,
): { status: BatchRow['status']; daysLeft: number | null } {
  if (remainingQty <= 0) return { status: 'depleted', daysLeft: expiryDate ? daysUntil(expiryDate) : null }
  if (!expiryDate) return { status: 'ok', daysLeft: null }
  const d = daysUntil(expiryDate)
  if (d < 0) return { status: 'expired', daysLeft: d }
  if (d <= 60) return { status: 'soon', daysLeft: d }
  return { status: 'ok', daysLeft: d }
}
