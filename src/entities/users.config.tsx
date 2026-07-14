import type { EntityTableConfig } from './types'
import type { AppUser, GlobalRole, Tone } from '@/mock/types'
import { MonoCell, SubCell, ToneBadge } from '@/components/entity-table/cells'

const globalRoleTone: Record<GlobalRole, Tone> = {
  ADMIN: 'red',
  MANAGER: 'accent',
  STAFF: 'teal',
  VIEWER: 'neutral',
}

export function createUsersConfig(companyName: string, companyCode: string): EntityTableConfig<AppUser> {
  return {
    key: 'users',
    title: 'Users & access',
    subtitle: 'Tenant membership & branch scope',
    primaryActionLabel: 'Invite user',
    searchKeys: ['name', 'email', 'companyRole'],
    getRowId: (row) => row.id,
    columns: [
      { key: 'name', header: 'User', sortable: true, sortValue: (r) => r.name, render: (r) => <SubCell main={r.name} sub={r.email} subMono={false} /> },
      { key: 'gRole', header: 'Global role', align: 'center', render: (r) => <ToneBadge tone={globalRoleTone[r.gRole]} label={r.gRole} /> },
      { key: 'companyRole', header: 'Company role', render: (r) => <ToneBadge tone="violet" label={r.companyRole} /> },
      {
        key: 'branches',
        header: 'Branch access',
        align: 'center',
        render: (r) => (
          <span className="text-[var(--text-2)]">
            {r.allBranches ? 'All branches' : `${r.branches} branch${r.branches > 1 ? 'es' : ''}`}
          </span>
        ),
      },
      { key: 'status', header: 'Status', align: 'center', render: (r) => <ToneBadge tone={r.status === 'Active' ? 'green' : 'amber'} label={r.status} dot /> },
      { key: 'last', header: 'Last active', align: 'right', render: (r) => <MonoCell value={r.last} color="var(--text-3)" /> },
    ],
    drawer: (row) => ({
      title: row.name,
      subtitle: row.email,
      badge: { label: row.status, tone: row.status === 'Active' ? 'green' : 'amber' },
      sections: [
        {
          label: 'Access',
          rows: [
            { label: 'Global role', value: row.gRole, tone: globalRoleTone[row.gRole] },
            { label: 'Company role', value: row.companyRole, tone: 'violet' },
            { label: 'Branch scope', value: row.allBranches ? 'All branches' : `${row.branches} branches` },
            { label: 'Last active', value: row.last },
          ],
        },
        {
          label: 'Company',
          rows: [
            { label: 'Tenant', value: companyName },
            { label: 'Company code', value: companyCode },
          ],
        },
      ],
    }),
  }
}
