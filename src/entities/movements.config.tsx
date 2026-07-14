import type { EntityTableConfig } from './types'
import type { StockMovement } from '@/mock/types'
import { MonoCell, SubCell, ToneBadge } from '@/components/entity-table/cells'
import { formatCurrency } from '@/lib/format'
import { movementTypeTone } from '@/lib/tone'

export interface MovementRow extends StockMovement {
  code: string
  name: string
}

export function createMovementsConfig(branchName: string): EntityTableConfig<MovementRow> {
  return {
    key: 'movements',
    title: 'Stock movements',
    subtitle: `Ledger · ${branchName}`,
    primaryActionLabel: 'New movement',
    searchKeys: ['ref', 'code', 'name'],
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
      { key: 'date', header: 'Date', sortable: true, sortValue: (r) => r.date, render: (r) => <MonoCell value={r.date} color="var(--text-2)" /> },
      { key: 'type', header: 'Type', render: (r) => <ToneBadge tone={movementTypeTone(r.type)} label={r.type.replace('_', ' ')} /> },
      { key: 'name', header: 'Product', render: (r) => <SubCell main={r.name} sub={r.code} /> },
      {
        key: 'qty',
        header: 'Qty',
        align: 'right',
        render: (r) => (
          <span className="font-mono text-[12px] font-semibold" style={{ color: r.qty > 0 ? 'var(--green)' : 'var(--red)' }}>
            {(r.qty > 0 ? '+' : '') + r.qty.toLocaleString()} {r.uom}
          </span>
        ),
      },
      { key: 'cost', header: 'Unit cost', align: 'right', render: (r) => <span className="font-mono text-[12px] text-[var(--text-3)]">{r.cost ? formatCurrency(r.cost) : '—'}</span> },
      { key: 'route', header: 'From → To', render: (r) => <MonoCell value={`${r.from || '—'} → ${r.to || '—'}`} color="var(--text-2)" /> },
      { key: 'ref', header: 'Reference', render: (r) => <MonoCell value={r.ref} color="var(--brand-accent-d)" /> },
    ],
    drawer: (row) => ({
      title: row.name,
      subtitle: row.ref,
      sections: [
        {
          label: 'Movement',
          rows: [
            { label: 'Type', value: row.type.replace('_', ' '), tone: movementTypeTone(row.type) },
            { label: 'Quantity', value: `${row.qty > 0 ? '+' : ''}${row.qty.toLocaleString()} ${row.uom}` },
            { label: 'Unit cost', value: row.cost ? formatCurrency(row.cost) : '—' },
            { label: 'Date', value: row.date },
          ],
        },
        {
          label: 'Trace',
          rows: [
            { label: 'From', value: row.from || '—' },
            { label: 'To', value: row.to || '—' },
            { label: 'Batch / Serial', value: row.batch || '—' },
            { label: 'Reference', value: row.ref },
          ],
        },
      ],
    }),
  }
}
