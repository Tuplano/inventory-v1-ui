import type { EntityTableConfig, MovementType, Tone } from './types'
import type { MovementRow } from './movements.config'
import { MonoCell, SubCell, ToneBadge } from '@/components/entity-table/cells'
import { ADJUST_STOCK_REASON_LABELS, type AdjustStockReason } from '@/hooks/mutations/use-adjust-stock'
import { movementTypeTone } from '@/lib/tone'

/** The movement types a manual adjustment can produce — a decrease's reason category is encoded in
 * the type itself (see AdjustStockReason on the API), so the page queries all three. */
export const ADJUSTMENT_TYPES: MovementType[] = ['ADJUSTMENT', 'DEFECTIVE', 'ISSUE']

const TYPE_TO_REASON: Partial<Record<MovementType, AdjustStockReason>> = {
  ADJUSTMENT: 'COUNT_CORRECTION',
  DEFECTIVE: 'DEFECTIVE',
  ISSUE: 'ISSUE',
}

/** Adjustments never set both — INCREASE sets toLocationId, DECREASE sets fromLocationId. Neither
 * set means it came from the old generic /stock-movements endpoint (no bin was recorded). */
function adjustmentDirection(row: MovementRow): 'INCREASE' | 'DECREASE' | null {
  if (row.toLocationId) return 'INCREASE'
  if (row.fromLocationId) return 'DECREASE'
  return null
}

/** Only decreases carry a reason — an increase ("found stock") is always a plain ADJUSTMENT. */
function adjustmentReason(row: MovementRow): AdjustStockReason | null {
  if (adjustmentDirection(row) !== 'DECREASE') return null
  return TYPE_TO_REASON[row.type] ?? null
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
    // Explicitly scoped to non-PO corrections so it doesn't get reached for as a catch-all —
    // sending stock back to a supplier has its own page (Supplier returns) because it needs a
    // PO/receiving-line reference, a reason, and a return number for the paper trail.
    subtitle: `Manual corrections not tied to a PO (count, damage, staff use) · ${branchName}`,
    primaryActionLabel: 'New adjustment',
    searchKeys: ['code', 'name', 'remarks'],
    getRowId: (row) => row.id,
    filters: [
      { key: 'all', label: 'All' },
      { key: 'INCREASE', label: 'Increase', queryParam: { key: 'direction', value: 'INCREASE' } },
      { key: 'DECREASE', label: 'Decrease', queryParam: { key: 'direction', value: 'DECREASE' } },
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
      {
        key: 'reason',
        header: 'Reason',
        render: (r) => {
          const reason = adjustmentReason(r)
          return reason ? <ToneBadge tone={movementTypeTone(r.type)} label={ADJUST_STOCK_REASON_LABELS[reason]} /> : <MonoCell value="—" color="var(--text-2)" />
        },
      },
      { key: 'createdByName', header: 'By', render: (r) => <MonoCell value={r.createdByName || '—'} color="var(--text-2)" /> },
      { key: 'remarks', header: 'Remarks', render: (r) => <MonoCell value={r.remarks ?? '—'} color="var(--text-2)" /> },
    ],
    drawer: (row) => {
      const direction = adjustmentDirection(row)
      const reason = adjustmentReason(row)
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
              { label: 'By', value: row.createdByName || '—' },
              { label: 'Date', value: row.createdAt.slice(0, 10) },
            ],
          },
          {
            label: 'Reason',
            rows: [
              { label: 'Category', value: reason ? ADJUST_STOCK_REASON_LABELS[reason] : '—' },
              { label: 'Remarks', value: row.remarks ?? '—' },
            ],
          },
        ],
      }
    },
  }
}
