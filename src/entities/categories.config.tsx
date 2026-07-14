import { z } from 'zod'
import type { EntityTableConfig } from './types'
import { MonoCell, ToneBadge } from '@/components/entity-table/cells'

export interface CategoryRecord {
  id: string
  companyId: string
  branchId: string
  name: string
  code: string
  description: string | null
  isActive: boolean
}

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  description: z.string().optional(),
})

export const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>

export function createCategoriesConfig(branchName: string): EntityTableConfig<CategoryRecord> {
  return {
    key: 'categories',
    title: 'Categories',
    subtitle: `Per-branch product categories · ${branchName}`,
    primaryActionLabel: 'New category',
    searchKeys: ['name', 'code'],
    getRowId: (row) => row.id,
    columns: [
      { key: 'code', header: 'Code', sortable: true, sortValue: (r) => r.code, render: (r) => <MonoCell value={r.code} color="var(--brand-accent-d)" weight={600} /> },
      { key: 'name', header: 'Category', sortable: true, sortValue: (r) => r.name, render: (r) => <span className="font-medium">{r.name}</span> },
      { key: 'description', header: 'Description', render: (r) => <span className="text-[var(--text-2)]">{r.description ?? '—'}</span> },
      { key: 'isActive', header: 'Status', align: 'center', render: (r) => <ToneBadge tone={r.isActive ? 'green' : 'neutral'} label={r.isActive ? 'Active' : 'Inactive'} dot /> },
    ],
    drawer: (row) => ({
      title: row.name,
      subtitle: row.code,
      badge: { label: row.isActive ? 'Active' : 'Inactive', tone: row.isActive ? 'green' : 'neutral' },
      sections: [
        {
          label: 'Category',
          rows: [
            { label: 'Code', value: row.code },
            { label: 'Description', value: row.description ?? '—' },
            { label: 'Branch', value: branchName },
          ],
        },
      ],
    }),
  }
}
