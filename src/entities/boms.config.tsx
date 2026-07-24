import { z } from 'zod'
import type { EntityTableConfig } from './types'
import { MonoCell, SubCell, ToneBadge } from '@/components/entity-table/cells'

export const createBomComponentSchema = z.object({
  componentProductId: z.string().min(1, 'Component product is required'),
  quantity: z.number().positive('Quantity must be greater than zero'),
})

export const createBomSchema = z.object({
  productId: z.string().min(1, 'Finished good product is required'),
  name: z.string().optional(),
  components: z.array(createBomComponentSchema).min(1, 'At least one component is required'),
})

export type CreateBomInput = z.infer<typeof createBomSchema>

export interface BomRow {
  id: string
  productId: string
  productName: string
  productSku: string
  name: string | null
  version: string
  isActive: boolean
  componentCount: number
  createdAt: string
}

export function createBomsConfig(branchName: string): EntityTableConfig<BomRow> {
  return {
    key: 'boms',
    title: 'Bills of materials',
    subtitle: `Manufacturing recipes · ${branchName}`,
    primaryActionLabel: 'New BOM',
    searchKeys: ['productName', 'productSku', 'name'],
    getRowId: (row) => row.id,
    getRowHref: (row) => `/boms/${row.id}`,
    filters: [
      { key: 'all', label: 'All' },
      { key: 'active', label: 'Active', predicate: (r) => r.isActive },
      { key: 'inactive', label: 'Inactive', predicate: (r) => !r.isActive },
    ],
    columns: [
      {
        key: 'productName',
        header: 'Finished good',
        sortable: true,
        sortValue: (r) => r.productName,
        render: (r) => <SubCell main={r.productName} sub={r.productSku} />,
      },
      { key: 'name', header: 'Recipe', render: (r) => <span className="font-medium">{r.name ?? '—'}</span> },
      { key: 'version', header: 'Version', render: (r) => <MonoCell value={r.version} color="var(--text-2)" /> },
      {
        key: 'componentCount',
        header: 'Components',
        sortable: true,
        sortValue: (r) => r.componentCount,
        render: (r) => <span className="font-mono text-[12px]">{r.componentCount}</span>,
      },
      {
        key: 'isActive',
        header: 'Status',
        render: (r) => <ToneBadge tone={r.isActive ? 'green' : 'neutral'} label={r.isActive ? 'Active' : 'Inactive'} dot />,
      },
    ],
  }
}
