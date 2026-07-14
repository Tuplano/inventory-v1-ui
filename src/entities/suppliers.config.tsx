import type { EntityTableConfig } from './types'
import type { Supplier } from '@/mock/types'
import { MonoCell, SubCell, ToneBadge } from '@/components/entity-table/cells'

export function createSuppliersConfig(companyCode: string): EntityTableConfig<Supplier> {
  return {
    key: 'suppliers',
    title: 'Suppliers',
    subtitle: `Vendors for ${companyCode}`,
    primaryActionLabel: 'New supplier',
    searchKeys: ['code', 'name', 'contact'],
    getRowId: (row) => row.id,
    columns: [
      { key: 'code', header: 'Code', sortable: true, sortValue: (r) => r.code, render: (r) => <MonoCell value={r.code} weight={600} /> },
      { key: 'name', header: 'Name', sortable: true, sortValue: (r) => r.name, render: (r) => <SubCell main={r.name} sub={r.email} subMono={false} /> },
      { key: 'contact', header: 'Contact', render: (r) => <span className="text-[var(--text-2)]">{r.contact}</span> },
      { key: 'phone', header: 'Phone', render: (r) => <MonoCell value={r.phone} color="var(--text-2)" /> },
      { key: 'active', header: 'Status', align: 'center', render: (r) => <ToneBadge tone={r.active ? 'green' : 'neutral'} label={r.active ? 'Active' : 'Inactive'} dot /> },
    ],
    drawer: (row) => ({
      title: row.name,
      subtitle: row.code,
      badge: { label: row.active ? 'Active' : 'Inactive', tone: row.active ? 'green' : 'neutral' },
      sections: [
        {
          label: 'Contact',
          rows: [
            { label: 'Contact', value: row.contact },
            { label: 'Email', value: row.email },
            { label: 'Phone', value: row.phone },
          ],
        },
        { label: 'Address', rows: [{ label: 'Location', value: row.address }] },
      ],
    }),
  }
}
