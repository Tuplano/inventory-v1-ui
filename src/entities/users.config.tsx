import type { EntityTableConfig, Tone } from './types'
import { MonoCell, SubCell, ToneBadge } from '@/components/entity-table/cells'

export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER'

/**
 * Real API shape (GET /api/v1/users) — this is the raw `User` table, scoped to
 * users with active company access, not a company-membership join. The mock's
 * `AppUser` had `companyRole`, `allBranches`/`branches`, `status`, and `last`
 * (last active) fields with no backend equivalent, so they're dropped here
 * rather than faked.
 */
export interface UserRecord {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
}

const roleTone: Record<UserRole, Tone> = {
  ADMIN: 'red',
  MANAGER: 'accent',
  STAFF: 'teal',
  VIEWER: 'neutral',
}

export function createUsersConfig(companyName: string, companyCode: string): EntityTableConfig<UserRecord> {
  return {
    key: 'users',
    title: 'Users & access',
    subtitle: 'Company membership',
    primaryActionLabel: 'Invite user',
    searchKeys: ['name', 'email', 'role'],
    getRowId: (row) => row.id,
    columns: [
      { key: 'name', header: 'User', sortable: true, sortValue: (r) => r.name, render: (r) => <SubCell main={r.name} sub={r.email} subMono={false} /> },
      { key: 'role', header: 'Global role', render: (r) => <ToneBadge tone={roleTone[r.role]} label={r.role} /> },
      {
        key: 'createdAt',
        header: 'Member since',
        render: (r) => <MonoCell value={new Date(r.createdAt).toLocaleDateString()} color="var(--text-3)" />,
      },
    ],
    drawer: (row) => ({
      title: row.name,
      subtitle: row.email,
      badge: { label: row.role, tone: roleTone[row.role] },
      sections: [
        {
          label: 'Access',
          rows: [
            { label: 'Global role', value: row.role, tone: roleTone[row.role] },
            { label: 'Member since', value: new Date(row.createdAt).toLocaleDateString() },
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
