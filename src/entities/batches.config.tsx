import type { EntityTableConfig } from './types'
import type { Batch, Tone } from '@/mock/types'
import { MonoCell, StockCell, SubCell, ToneBadge } from '@/components/entity-table/cells'
import { daysUntil } from '@/lib/format'

export interface BatchRow extends Batch {
  code: string
  name: string
  daysLeft: number
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
  if (row.status === 'soon') return `${row.daysLeft}d left`
  if (row.status === 'depleted') return 'Depleted'
  return 'OK'
}

export function createBatchesConfig(branchName: string): EntityTableConfig<BatchRow> {
  return {
    key: 'batches',
    title: 'Batches',
    subtitle: `Lot tracking & expiry · ${branchName}`,
    primaryActionLabel: 'New batch',
    searchKeys: ['batchNo', 'name'],
    getRowId: (row) => row.id,
    filters: [
      { key: 'all', label: 'All' },
      { key: 'expired', label: 'Expired', predicate: (r) => r.status === 'expired' },
      { key: 'soon', label: 'Expiring ≤60d', predicate: (r) => r.status === 'soon' },
      { key: 'ok', label: 'OK', predicate: (r) => r.status === 'ok' },
      { key: 'depleted', label: 'Depleted', predicate: (r) => r.status === 'depleted' },
    ],
    columns: [
      { key: 'batchNo', header: 'Batch #', sortable: true, sortValue: (r) => r.batchNo, render: (r) => <MonoCell value={r.batchNo} weight={600} /> },
      { key: 'lot', header: 'Lot', render: (r) => <MonoCell value={r.lot} color="var(--text-2)" /> },
      { key: 'name', header: 'Product', render: (r) => <SubCell main={r.name} sub={r.code} /> },
      { key: 'mfg', header: 'Mfg', render: (r) => <MonoCell value={r.mfg} color="var(--text-3)" /> },
      {
        key: 'expiry',
        header: 'Expiry',
        sortable: true,
        sortValue: (r) => r.expiry,
        render: (r) => (
          <MonoCell
            value={r.expiry}
            weight={600}
            color={r.status === 'expired' ? 'var(--red)' : r.status === 'soon' ? 'var(--amber)' : 'var(--text-2)'}
          />
        ),
      },
      {
        key: 'remaining',
        header: 'Remaining',
        align: 'right',
        render: (r) => (
          <StockCell
            value={r.remaining.toLocaleString()}
            pct={Math.round((r.remaining / (r.initial || 1)) * 100)}
            tone={r.status === 'expired' ? 'red' : 'teal'}
          />
        ),
      },
      { key: 'status', header: 'Status', align: 'center', render: (r) => <ToneBadge tone={statusMeta[r.status].tone} label={statusLabel(r)} dot /> },
    ],
    drawer: (row) => ({
      title: row.name,
      subtitle: row.batchNo,
      badge: { label: statusLabel(row), tone: statusMeta[row.status].tone },
      sections: [
        {
          label: 'Lot',
          rows: [
            { label: 'Manufactured', value: row.mfg },
            { label: 'Expiry', value: row.expiry },
            { label: 'Days to expiry', value: row.daysLeft < 0 ? `expired ${-row.daysLeft}d ago` : `${row.daysLeft}d` },
            { label: 'Remaining', value: row.remaining.toLocaleString() },
          ],
        },
      ],
    }),
  }
}

export function batchStatus(remaining: number, expiry: string): { status: BatchRow['status']; daysLeft: number } {
  const d = daysUntil(expiry)
  if (remaining <= 0) return { status: 'depleted', daysLeft: d }
  if (d < 0) return { status: 'expired', daysLeft: d }
  if (d <= 60) return { status: 'soon', daysLeft: d }
  return { status: 'ok', daysLeft: d }
}
