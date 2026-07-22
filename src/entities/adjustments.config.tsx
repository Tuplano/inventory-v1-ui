import type { EntityTableConfig, Tone } from './types'
import type { MovementRow } from './movements.config'
import { MonoCell, SubCell, ToneBadge } from '@/components/entity-table/cells'

/** Adjustments never set both — INCREASE sets toLocationId, DECREASE sets fromLocationId. Neither
 * set means it came from the old generic /stock-movements endpoint (no bin was recorded). */
function adjustmentDirection(row: MovementRow): 'INCREASE' | 'DECREASE' | null {
  if (row.toLocationId) return 'INCREASE'
  if (row.fromLocationId) return 'DECREASE'
  return null
}

function directionTone(direction: 'INCREASE' | 'DECREASE' | null): Tone {
  if (direction === 'INCREASE') return 'green'
  if (direction === 'DECREASE') return 'red'
  return 'neutral'
}

export function createAdjustmentsConfig(branchName: string): EntityTableConfig<MovementRow> {
  return {
    key: 'adjustments',
    title: 'Stock adjustments',
    subtitle: `Corrections · ${branchName}`,
    primaryActionLabel: 'New adjustment',
    searchKeys: ['code', 'name', 'remarks'],
    getRowId: (row) => row.id,
    filters: [
      { key: 'all', label: 'All' },
      { key: 'INCREASE', label: 'Increase', predicate: (r) => adjustmentDirection(r) === 'INCREASE' },
      { key: 'DECREASE', label: 'Decrease', predicate: (r) => adjustmentDirection(r) === 'DECREASE' },
    ],
    columns: [
      { key: 'createdAt', header: 'Date', sortable: true, sortValue: (r) => r.createdAt, render: (r) => <MonoCell value={r.createdAt.slice(0, 10)} color="var(--text-2)" /> },
      { key: 'name', header: 'Product', render: (r) => <SubCell main={r.name} sub={r.code} /> },
      {
        key: 'direction',
        header: 'Direction',
        render: (r) => {
          const direction = adjustmentDirection(r)
          return <ToneBadge tone={directionTone(direction)} label={direction ? (direction === 'INCREASE' ? 'Increase' : 'Decrease') : '—'} />
        },
      },
      {
        key: 'quantity',
        header: 'Qty',
        render: (r) => (
          <span className="font-mono text-[12px] font-semibold" style={{ color: adjustmentDirection(r) === 'DECREASE' ? 'var(--red)' : 'var(--green)' }}>
            {(adjustmentDirection(r) === 'DECREASE' ? '-' : '+') + r.quantity.toLocaleString()} {r.uom}
          </span>
        ),
      },
      {
        key: 'bin',
        header: 'Bin',
        render: (r) => <MonoCell value={r.toLocationId ? r.toLabel : r.fromLocationId ? r.fromLabel : '—'} color="var(--text-2)" />,
      },
      { key: 'batchLabel', header: 'Batch', render: (r) => <MonoCell value={r.batchLabel || '—'} color="var(--text-2)" /> },
      { key: 'remarks', header: 'Reason', render: (r) => <MonoCell value={r.remarks ?? '—'} color="var(--text-2)" /> },
    ],
    drawer: (row) => {
      const direction = adjustmentDirection(row)
      return {
        title: row.name,
        subtitle: row.code,
        badge: { label: direction ? (direction === 'INCREASE' ? 'Increase' : 'Decrease') : 'Adjustment', tone: directionTone(direction) },
        sections: [
          {
            label: 'Adjustment',
            rows: [
              { label: 'Quantity', value: `${direction === 'DECREASE' ? '-' : '+'}${row.quantity.toLocaleString()} ${row.uom}` },
              { label: 'Bin', value: row.toLocationId ? row.toLabel : row.fromLocationId ? row.fromLabel : '—' },
              { label: 'Batch', value: row.batchLabel || '—' },
              { label: 'Date', value: row.createdAt.slice(0, 10) },
            ],
          },
          {
            label: 'Reason',
            rows: [{ label: 'Remarks', value: row.remarks ?? '—' }],
          },
        ],
      }
    },
  }
}
