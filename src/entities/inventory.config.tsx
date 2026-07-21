import { z } from 'zod'
import type { EntityTableConfig } from './types'
import { MonoCell, StockCell, ToneBadge } from '@/components/entity-table/cells'
import { InventoryLocationsPanel } from '@/components/inventory/InventoryLocationsPanel'
import { stockTone } from '@/lib/tone'

export const updateInventoryItemSchema = z.object({
  minStockLevel: z.number().nonnegative('Min stock level must be 0 or greater').nullable().optional(),
  maxStockLevel: z.number().nonnegative('Max stock level must be 0 or greater').nullable().optional(),
})

export type UpdateInventoryItemInput = z.infer<typeof updateInventoryItemSchema>

/** Raw wire shape from GET /inventory-items (Decimal fields arrive as strings). */
export interface InventoryItemRecord {
  id: string
  companyId: string
  branchId: string
  productId: string
  quantity: string
  minStockLevel: string | null
  maxStockLevel: string | null
  product: {
    id: string
    name: string
    sku: string
    barcode: string | null
    baseUom: {
      id: string
      name: string
      abbreviation: string
    }
  }
}

export interface InventoryRow {
  id: string
  companyId: string
  branchId: string
  productId: string
  quantity: number
  minStockLevel: number | null
  maxStockLevel: number | null
  code: string
  name: string
  barcode: string | null
  base: string
  status: 'out' | 'low' | 'ok'
  /** Received but never assigned to a bin location (see /product-locations/unplaced). */
  floatingQty: number
}

export function createInventoryConfig(branchName: string): EntityTableConfig<InventoryRow> {
  return {
    key: 'inventory',
    title: 'Inventory items',
    subtitle: `Stock levels at ${branchName}`,
    searchKeys: ['code', 'name'],
    getRowId: (row) => row.id,
    filters: [
      { key: 'all', label: 'All' },
      { key: 'low', label: 'Low stock', predicate: (r) => r.status !== 'ok' },
      { key: 'ok', label: 'Healthy', predicate: (r) => r.status === 'ok' },
      { key: 'unplaced', label: 'Needs placement', predicate: (r) => r.floatingQty > 0 },
    ],
    columns: [
      { key: 'code', header: 'Code', sortable: true, sortValue: (r) => r.code, render: (r) => <MonoCell value={r.code} color="var(--brand-accent-d)" weight={600} /> },
      { key: 'name', header: 'Product', sortable: true, sortValue: (r) => r.name, render: (r) => <span className="font-medium">{r.name}</span> },
      { key: 'minStockLevel', header: 'Min', render: (r) => <span className="font-mono text-[12px] text-[var(--text-3)]">{r.minStockLevel != null ? r.minStockLevel.toLocaleString() : '—'}</span> },
      { key: 'maxStockLevel', header: 'Max', render: (r) => <span className="font-mono text-[12px] text-[var(--text-3)]">{r.maxStockLevel != null ? r.maxStockLevel.toLocaleString() : '—'}</span> },
      {
        key: 'quantity',
        header: 'On hand',
        sortable: true,
        sortValue: (r) => r.quantity,
        render: (r) => (
          <StockCell
            value={r.quantity.toLocaleString()}
            pct={r.maxStockLevel ? Math.round((r.quantity / r.maxStockLevel) * 100) : 100}
            tone={stockTone(r.quantity, r.minStockLevel ?? 0)}
          />
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (r) => (
          <ToneBadge
            tone={r.status === 'out' ? 'red' : r.status === 'low' ? 'amber' : 'green'}
            label={r.status === 'out' ? 'Out' : r.status === 'low' ? 'Low' : 'Healthy'}
            dot
          />
        ),
      },
      {
        key: 'floatingQty',
        header: 'Placement',
        sortable: true,
        sortValue: (r) => r.floatingQty,
        render: (r) =>
          r.floatingQty > 0 ? (
            <ToneBadge tone="amber" label={`${r.floatingQty.toLocaleString()} unplaced`} dot />
          ) : (
            <span className="font-mono text-[11px] text-[var(--text-3)]">—</span>
          ),
      },
    ],
    drawerExtra: InventoryLocationsPanel,
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
            { label: 'On hand', value: row.quantity.toLocaleString() },
            { label: 'Minimum', value: row.minStockLevel != null ? row.minStockLevel.toLocaleString() : '—' },
            { label: 'Maximum', value: row.maxStockLevel != null ? row.maxStockLevel.toLocaleString() : '—' },
          ],
        },
        {
          label: 'Reorder',
          rows: [
            {
              label: 'Suggested order',
              value:
                row.status !== 'ok' && row.maxStockLevel != null
                  ? `${(row.maxStockLevel - row.quantity).toLocaleString()} ${row.base}`
                  : '—',
            },
          ],
        },
      ],
    }),
  }
}
