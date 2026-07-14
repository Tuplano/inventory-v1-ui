import type { EntityTableConfig } from './types'
import type { InventoryItem } from '@/mock/types'
import { MonoCell, StockCell, ToneBadge } from '@/components/entity-table/cells'
import { stockTone } from '@/lib/tone'

export interface InventoryRow extends InventoryItem {
  code: string
  name: string
  base: string
  supplierName: string
  status: 'out' | 'low' | 'ok'
}

export function createInventoryConfig(branchName: string): EntityTableConfig<InventoryRow> {
  return {
    key: 'inventory',
    title: 'Inventory items',
    subtitle: `Stock levels at ${branchName}`,
    primaryActionLabel: 'Adjust stock',
    searchKeys: ['code', 'name'],
    getRowId: (row) => row.productId,
    filters: [
      { key: 'all', label: 'All' },
      { key: 'low', label: 'Low stock', predicate: (r) => r.status !== 'ok' },
      { key: 'ok', label: 'Healthy', predicate: (r) => r.status === 'ok' },
    ],
    columns: [
      { key: 'code', header: 'Code', sortable: true, sortValue: (r) => r.code, render: (r) => <MonoCell value={r.code} color="var(--brand-accent-d)" weight={600} /> },
      { key: 'name', header: 'Product', sortable: true, sortValue: (r) => r.name, render: (r) => <span className="font-medium">{r.name}</span> },
      { key: 'loc', header: 'Location', align: 'center', render: (r) => <MonoCell value={r.loc} color="var(--text-2)" /> },
      { key: 'min', header: 'Min', align: 'right', render: (r) => <span className="font-mono text-[12px] text-[var(--text-3)]">{r.min.toLocaleString()}</span> },
      { key: 'max', header: 'Max', align: 'right', render: (r) => <span className="font-mono text-[12px] text-[var(--text-3)]">{r.max.toLocaleString()}</span> },
      {
        key: 'qty',
        header: 'On hand',
        align: 'right',
        sortable: true,
        sortValue: (r) => r.qty,
        render: (r) => <StockCell value={r.qty.toLocaleString()} pct={Math.round((r.qty / r.max) * 100)} tone={stockTone(r.qty, r.min)} />,
      },
      {
        key: 'status',
        header: 'Status',
        align: 'center',
        render: (r) => (
          <ToneBadge
            tone={r.status === 'out' ? 'red' : r.status === 'low' ? 'amber' : 'green'}
            label={r.status === 'out' ? 'Out' : r.status === 'low' ? 'Low' : 'Healthy'}
            dot
          />
        ),
      },
    ],
    drawer: (row) => ({
      title: row.name,
      subtitle: row.code,
      badge: {
        label: row.status === 'out' ? 'Out' : row.status === 'low' ? 'Low' : 'Healthy',
        tone: row.status === 'out' ? 'red' : row.status === 'low' ? 'amber' : 'green',
      },
      sections: [
        {
          label: 'Levels',
          rows: [
            { label: 'On hand', value: row.qty.toLocaleString() },
            { label: 'Minimum', value: row.min.toLocaleString() },
            { label: 'Maximum', value: row.max.toLocaleString() },
            { label: 'Location', value: row.loc },
          ],
        },
        {
          label: 'Reorder',
          rows: [
            { label: 'Suggested order', value: row.status !== 'ok' ? `${(row.max - row.qty).toLocaleString()} ${row.base}` : '—' },
            { label: 'Preferred supplier', value: row.supplierName },
          ],
        },
      ],
    }),
  }
}
