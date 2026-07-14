import type { EntityTableConfig } from './types'
import type { Category } from '@/mock/types'
import { MonoCell } from '@/components/entity-table/cells'

export function createCategoriesConfig(branchName: string): EntityTableConfig<Category> {
  return {
    key: 'categories',
    title: 'Categories',
    subtitle: `Per-branch product categories · ${branchName}`,
    primaryActionLabel: 'New category',
    searchKeys: ['name'],
    getRowId: (row) => row.id,
    columns: [
      { key: 'code', header: 'Code', sortable: true, sortValue: (r) => r.code, render: (r) => <MonoCell value={r.code} color="var(--brand-accent-d)" weight={600} /> },
      { key: 'name', header: 'Category', sortable: true, sortValue: (r) => r.name, render: (r) => <span className="font-medium">{r.name}</span> },
      { key: 'description', header: 'Description', render: (r) => <span className="text-[var(--text-2)]">{r.description}</span> },
      { key: 'products', header: 'Products', align: 'right', sortable: true, sortValue: (r) => r.products, render: (r) => <span className="font-mono text-[12px]">{r.products.toLocaleString()}</span> },
    ],
    drawer: (row) => ({
      title: row.name,
      subtitle: row.code,
      sections: [
        {
          label: 'Category',
          rows: [
            { label: 'Code', value: row.code },
            { label: 'Description', value: row.description },
            { label: 'Products', value: row.products.toLocaleString() },
            { label: 'Branch', value: branchName },
          ],
        },
      ],
    }),
  }
}
