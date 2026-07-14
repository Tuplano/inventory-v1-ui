import type { EntityTableConfig, MovementType } from './types'
import { MonoCell, SubCell, ToneBadge } from '@/components/entity-table/cells'
import { formatCurrency } from '@/lib/format'
import { movementTypeTone } from '@/lib/tone'

/** Raw wire shape from GET /stock-movements (Decimal fields arrive as strings). */
export interface StockMovementRecord {
  id: string
  companyId: string
  branchId: string
  productId: string
  type: MovementType
  quantity: string
  unitCost: string | null
  reference: string | null
  notes: string | null
  createdById: string | null
  purchaseOrderLineId: string | null
  fromLocationId: string | null
  toLocationId: string | null
  batchId: string | null
  serialNumberId: string | null
  createdAt: string
}

export interface MovementRow {
  id: string
  companyId: string
  branchId: string
  productId: string
  type: MovementType
  quantity: number
  unitCost: number | null
  reference: string | null
  notes: string | null
  fromLocationId: string | null
  toLocationId: string | null
  batchId: string | null
  serialNumberId: string | null
  createdAt: string
  code: string
  name: string
  uom: string
  fromLabel: string
  toLabel: string
  batchLabel: string
}

export function createMovementsConfig(branchName: string): EntityTableConfig<MovementRow> {
  return {
    key: 'movements',
    title: 'Stock movements',
    subtitle: `Ledger · ${branchName}`,
    primaryActionLabel: 'New movement',
    searchKeys: ['reference', 'code', 'name'],
    getRowId: (row) => row.id,
    filters: [
      { key: 'all', label: 'All' },
      { key: 'RECEIVING', label: 'Receiving', predicate: (r) => r.type === 'RECEIVING' },
      { key: 'ISSUE', label: 'Issue', predicate: (r) => r.type === 'ISSUE' },
      { key: 'ADJUSTMENT', label: 'Adjustment', predicate: (r) => r.type === 'ADJUSTMENT' },
      { key: 'TRANSFER', label: 'Transfer', predicate: (r) => r.type.startsWith('TRANSFER') },
      { key: 'RETURN', label: 'Return', predicate: (r) => r.type === 'RETURN' },
    ],
    columns: [
      { key: 'createdAt', header: 'Date', sortable: true, sortValue: (r) => r.createdAt, render: (r) => <MonoCell value={r.createdAt.slice(0, 10)} color="var(--text-2)" /> },
      { key: 'type', header: 'Type', render: (r) => <ToneBadge tone={movementTypeTone(r.type)} label={r.type.replace('_', ' ')} /> },
      { key: 'name', header: 'Product', render: (r) => <SubCell main={r.name} sub={r.code} /> },
      {
        key: 'quantity',
        header: 'Qty',
        align: 'right',
        render: (r) => (
          <span className="font-mono text-[12px] font-semibold" style={{ color: r.quantity > 0 ? 'var(--green)' : 'var(--red)' }}>
            {(r.quantity > 0 ? '+' : '') + r.quantity.toLocaleString()} {r.uom}
          </span>
        ),
      },
      { key: 'unitCost', header: 'Unit cost', align: 'right', render: (r) => <span className="font-mono text-[12px] text-[var(--text-3)]">{r.unitCost != null ? formatCurrency(r.unitCost) : '—'}</span> },
      { key: 'route', header: 'From → To', render: (r) => <MonoCell value={`${r.fromLabel} → ${r.toLabel}`} color="var(--text-2)" /> },
      { key: 'reference', header: 'Reference', render: (r) => <MonoCell value={r.reference ?? '—'} color="var(--brand-accent-d)" /> },
    ],
    drawer: (row) => ({
      title: row.name,
      subtitle: row.reference ?? row.id,
      sections: [
        {
          label: 'Movement',
          rows: [
            { label: 'Type', value: row.type.replace('_', ' '), tone: movementTypeTone(row.type) },
            { label: 'Quantity', value: `${row.quantity > 0 ? '+' : ''}${row.quantity.toLocaleString()} ${row.uom}` },
            { label: 'Unit cost', value: row.unitCost != null ? formatCurrency(row.unitCost) : '—' },
            { label: 'Date', value: row.createdAt.slice(0, 10) },
          ],
        },
        {
          label: 'Trace',
          rows: [
            { label: 'From', value: row.fromLabel },
            { label: 'To', value: row.toLabel },
            { label: 'Batch', value: row.batchLabel || '—' },
            { label: 'Reference', value: row.reference ?? '—' },
          ],
        },
      ],
    }),
  }
}
