import type { EntityTableConfig } from './types'
import type { Branch, Company } from '@/mock/types'
import { MonoCell, SubCell, ToneBadge } from '@/components/entity-table/cells'

export interface CompanyRow extends Company {
  branchCount: number
  companyBranches: Branch[]
}

export function createCompaniesConfig(): EntityTableConfig<CompanyRow> {
  return {
    key: 'companies',
    title: 'Companies & branches',
    subtitle: 'Tenant structure',
    primaryActionLabel: 'New company',
    searchKeys: ['name', 'code'],
    getRowId: (row) => row.id,
    columns: [
      { key: 'name', header: 'Company', sortable: true, sortValue: (r) => r.name, render: (r) => <SubCell main={r.name} sub={r.email} subMono={false} /> },
      { key: 'code', header: 'Code', align: 'center', render: (r) => <MonoCell value={r.code} weight={600} /> },
      { key: 'branchCount', header: 'Branches', align: 'right', render: (r) => <span className="font-mono text-[12px]">{r.branchCount}</span> },
      { key: 'legal', header: 'Legal entity', render: (r) => <span className="text-[var(--text-2)]">{r.legal}</span> },
      { key: 'active', header: 'Status', align: 'center', render: (r) => <ToneBadge tone={r.active ? 'green' : 'neutral'} label={r.active ? 'Active' : 'Inactive'} dot /> },
    ],
    drawer: (row) => ({
      title: row.name,
      subtitle: row.code,
      badge: { label: row.active ? 'Active' : 'Inactive', tone: row.active ? 'green' : 'neutral' },
      sections: [
        {
          label: 'Entity',
          rows: [
            { label: 'Legal name', value: row.legal },
            { label: 'Tax ID', value: row.tax },
            { label: 'Email', value: row.email },
          ],
        },
        {
          label: 'Branches',
          rows: row.companyBranches.map((b) => ({ label: b.name, value: b.code })),
        },
      ],
    }),
  }
}
