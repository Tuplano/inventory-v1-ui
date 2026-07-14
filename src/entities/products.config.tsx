import { z } from 'zod'
import type { EntityTableConfig, Tone } from './types'
import { MonoCell, ToneBadge } from '@/components/entity-table/cells'

export const trackingTypes = ['NONE', 'BATCH', 'SERIAL'] as const
export type TrackingType = (typeof trackingTypes)[number]

export interface UomSummary {
  id: string
  name: string
  abbreviation: string
  type: string
}

export interface ProductRecord {
  id: string
  companyId: string
  categoryId: string | null
  name: string
  code: string
  description: string | null
  baseUomId: string
  purchaseUomId: string | null
  saleUomId: string | null
  trackingType: TrackingType
  isActive: boolean
  baseUom: UomSummary
  purchaseUom: UomSummary | null
  saleUom: UomSummary | null
}

export interface ProductRow extends ProductRecord {
  categoryName?: string
}

export const createProductSchema = z.object({
  categoryId: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  description: z.string().optional(),
  baseUomId: z.string().min(1, 'Base unit is required'),
  purchaseUomId: z.string().optional(),
  saleUomId: z.string().optional(),
  trackingType: z.enum(trackingTypes).optional(),
})

export const updateProductSchema = z.object({
  categoryId: z.string().nullable().optional(),
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  baseUomId: z.string().min(1).optional(),
  purchaseUomId: z.string().nullable().optional(),
  saleUomId: z.string().nullable().optional(),
  trackingType: z.enum(trackingTypes).optional(),
  isActive: z.boolean().optional(),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>

export function trackTone(track: TrackingType): Tone {
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
    searchKeys: ['code', 'name'],
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
        key: 'category',
        header: 'Category',
        sortable: true,
        sortValue: (r) => r.categoryName ?? '',
        render: (r) => <ToneBadge tone="neutral" label={r.categoryName ?? '—'} />,
      },
      {
        key: 'track',
        header: 'Tracking',
        align: 'center',
        render: (r) => <ToneBadge tone={trackTone(r.trackingType)} label={r.trackingType} />,
      },
      { key: 'base', header: 'Base', align: 'center', render: (r) => <MonoCell value={r.baseUom.abbreviation} color="var(--text-2)" /> },
      { key: 'purch', header: 'Purchase', align: 'center', render: (r) => <MonoCell value={r.purchaseUom?.abbreviation ?? '—'} color="var(--text-2)" /> },
      { key: 'sale', header: 'Sale', align: 'center', render: (r) => <MonoCell value={r.saleUom?.abbreviation ?? '—'} color="var(--text-2)" /> },
      { key: 'isActive', header: 'Status', align: 'center', render: (r) => <ToneBadge tone={r.isActive ? 'green' : 'neutral'} label={r.isActive ? 'Active' : 'Inactive'} dot /> },
    ],
    drawer: (row) => ({
      title: row.name,
      subtitle: row.code,
      badge: { label: row.trackingType, tone: trackTone(row.trackingType) },
      sections: [
        {
          label: 'Details',
          rows: [
            { label: 'Category', value: row.categoryName ?? '—' },
            { label: 'Tracking', value: row.trackingType },
            { label: 'Status', value: row.isActive ? 'Active' : 'Inactive' },
          ],
        },
        {
          label: 'Units',
          rows: [
            { label: 'Base UOM', value: `${row.baseUom.abbreviation} — ${row.baseUom.name}` },
            { label: 'Purchase UOM', value: row.purchaseUom ? `${row.purchaseUom.abbreviation} — ${row.purchaseUom.name}` : '—' },
            { label: 'Sale UOM', value: row.saleUom ? `${row.saleUom.abbreviation} — ${row.saleUom.name}` : '—' },
          ],
        },
      ],
    }),
  }
}
