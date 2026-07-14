import type { EntityTableConfig } from './types'
import type { Product, Tone } from '@/mock/types'
import { MonoCell, ToneBadge } from '@/components/entity-table/cells'

export interface ProductRow extends Product {
  supplierName: string
  inventoryQty?: number
  inventoryMin?: number
  inventoryMax?: number
  inventoryLoc?: string
}

export function trackTone(track: Product['track']): Tone {
  if (track === 'SERIAL') return 'violet'
  if (track === 'BATCH') return 'teal'
  return 'neutral'
}

export function createProductsConfig(companyCode: string): EntityTableConfig<ProductRow> {
  return {
    key: 'products',
    title: 'Products',
    subtitle: `Catalog SKUs · scoped to ${companyCode}`,
    primaryActionLabel: 'New product',
    searchKeys: ['code', 'name', 'cat'],
    getRowId: (row) => row.id,
    columns: [
      {
        key: 'code',
        header: 'Code',
        sortable: true,
        sortValue: (r) => r.code,
        render: (r) => <MonoCell value={r.code} color="var(--brand-accent-d)" weight={600} />,
      },
      {
        key: 'name',
        header: 'Name',
        sortable: true,
        sortValue: (r) => r.name,
        render: (r) => <span className="font-medium">{r.name}</span>,
      },
      {
        key: 'cat',
        header: 'Category',
        sortable: true,
        sortValue: (r) => r.cat,
        render: (r) => <ToneBadge tone="neutral" label={r.cat} />,
      },
      {
        key: 'track',
        header: 'Tracking',
        align: 'center',
        render: (r) => <ToneBadge tone={trackTone(r.track)} label={r.track} />,
      },
      { key: 'base', header: 'Base', align: 'center', render: (r) => <MonoCell value={r.base} color="var(--text-2)" /> },
      { key: 'purch', header: 'Purchase', align: 'center', render: (r) => <MonoCell value={r.purch} color="var(--text-2)" /> },
      { key: 'sale', header: 'Sale', align: 'center', render: (r) => <MonoCell value={r.sale} color="var(--text-2)" /> },
      { key: 'sup', header: 'Supplier', render: (r) => <span className="text-[var(--text-2)]">{r.supplierName}</span> },
    ],
    drawer: (row) => ({
      title: row.name,
      subtitle: row.code,
      badge: { label: row.track, tone: trackTone(row.track) },
      sections: [
        {
          label: 'Details',
          rows: [
            { label: 'Category', value: row.cat },
            { label: 'Tracking', value: row.track },
            { label: 'Supplier', value: row.supplierName },
          ],
        },
        {
          label: 'Units',
          rows: [
            { label: 'Base UOM', value: row.base },
            { label: 'Purchase UOM', value: row.purch },
            { label: 'Sale UOM', value: row.sale },
          ],
        },
        {
          label: 'Stock',
          rows:
            row.inventoryQty != null
              ? [
                  { label: 'On hand', value: row.inventoryQty.toLocaleString() },
                  { label: 'Min / Max', value: `${row.inventoryMin} / ${row.inventoryMax}` },
                  { label: 'Location', value: row.inventoryLoc },
                ]
              : [{ label: 'On hand', value: '—' }],
        },
      ],
    }),
  }
}
