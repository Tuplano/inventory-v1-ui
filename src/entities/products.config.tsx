import { z } from 'zod'
import type { EntityTableConfig, Tone } from './types'
import { MonoCell, NumberCell, ToneBadge } from '@/components/entity-table/cells'

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
  sku: string
  barcode: string | null
  brand: string | null
  description: string | null
  baseUomId: string
  purchaseUomId: string | null
  saleUomId: string | null
  trackingType: TrackingType
  /** Serialized as a string on the wire (Prisma Decimal → JSON). */
  costPrice: string | null
  sellingPrice: string | null
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
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  brand: z.string().optional(),
  description: z.string().optional(),
  baseUomId: z.string().min(1, 'Base unit is required'),
  purchaseUomId: z.string().optional(),
  saleUomId: z.string().optional(),
  trackingType: z.enum(trackingTypes).optional(),
  costPrice: z.number().nonnegative().optional(),
  sellingPrice: z.number().nonnegative().optional(),
})

export const updateProductSchema = z.object({
  categoryId: z.string().nullable().optional(),
  name: z.string().min(1).optional(),
  sku: z.string().min(1).optional(),
  barcode: z.string().nullable().optional(),
  brand: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  baseUomId: z.string().min(1).optional(),
  purchaseUomId: z.string().nullable().optional(),
  saleUomId: z.string().nullable().optional(),
  trackingType: z.enum(trackingTypes).optional(),
  costPrice: z.number().nonnegative().nullable().optional(),
  sellingPrice: z.number().nonnegative().nullable().optional(),
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
    searchKeys: ['sku', 'name', 'barcode', 'brand'],
    getRowId: (row) => row.id,
    columns: [
      {
        key: 'sku',
        header: 'SKU',
        sortable: true,
        sortValue: (r) => r.sku,
        render: (r) => <MonoCell value={r.sku} color="var(--brand-accent-d)" weight={600} />,
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
        render: (r) => <ToneBadge tone={trackTone(r.trackingType)} label={r.trackingType} />,
      },
      { key: 'base', header: 'Base', render: (r) => <MonoCell value={r.baseUom.abbreviation} color="var(--text-2)" /> },
      {
        key: 'sellingPrice',
        header: 'Price',
        align: 'right',
        sortable: true,
        sortValue: (r) => Number(r.sellingPrice ?? 0),
        render: (r) => (r.sellingPrice != null ? <NumberCell value={Number(r.sellingPrice)} format="currency" /> : <MonoCell value="—" color="var(--text-3)" />),
      },
      { key: 'isActive', header: 'Status', render: (r) => <ToneBadge tone={r.isActive ? 'green' : 'neutral'} label={r.isActive ? 'Active' : 'Inactive'} dot /> },
    ],
    drawer: (row) => ({
      title: row.name,
      subtitle: row.sku,
      badge: { label: row.trackingType, tone: trackTone(row.trackingType) },
      sections: [
        {
          label: 'Details',
          rows: [
            { label: 'Category', value: row.categoryName ?? '—' },
            { label: 'Brand', value: row.brand ?? '—' },
            { label: 'Barcode', value: row.barcode ?? '—' },
            { label: 'Tracking', value: row.trackingType },
            { label: 'Status', value: row.isActive ? 'Active' : 'Inactive' },
          ],
        },
        {
          label: 'Pricing',
          rows: [
            { label: 'Cost price', value: row.costPrice != null ? `$${Number(row.costPrice).toFixed(2)}` : '—' },
            { label: 'Selling price', value: row.sellingPrice != null ? `$${Number(row.sellingPrice).toFixed(2)}` : '—' },
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
