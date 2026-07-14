import type { DrawerSection, EntityTableConfig } from './types'
import type { Permission, Role } from '@/mock/types'

export interface RoleRow extends Role {
  totalPermissions: number
  allPermissions: Permission[]
}

export function createRolesConfig(companyCode: string): EntityTableConfig<RoleRow> {
  return {
    key: 'roles',
    title: 'Roles & permissions',
    subtitle: `RBAC scoped to ${companyCode}`,
    primaryActionLabel: 'New role',
    searchKeys: ['name', 'desc'],
    getRowId: (row) => row.id,
    columns: [
      { key: 'name', header: 'Role', sortable: true, sortValue: (r) => r.name, render: (r) => <span className="font-semibold">{r.name}</span> },
      { key: 'desc', header: 'Description', render: (r) => <span className="text-[var(--text-2)]">{r.desc}</span> },
      {
        key: 'perms',
        header: 'Permissions',
        align: 'right',
        render: (r) => (
          <span className="font-mono text-[12px] text-[var(--brand-accent-d)]">
            {r.perms} / {r.totalPermissions}
          </span>
        ),
      },
      { key: 'users', header: 'Users', align: 'right', render: (r) => <span className="font-mono text-[12px]">{r.users}</span> },
    ],
    drawer: (row) => {
      const grouped: Record<string, Permission[]> = {}
      row.allPermissions.forEach((p) => {
        ;(grouped[p.module] ??= []).push(p)
      })
      let grantedCount = 0
      const sections: DrawerSection[] = [{ label: 'Description', rows: [{ label: 'Summary', value: row.desc }] }]
      Object.entries(grouped).forEach(([module, perms]) => {
        sections.push({
          label: module,
          rows: perms.map((p) => {
            const granted = grantedCount < row.perms
            grantedCount++
            return { label: p.code, value: granted ? 'granted' : '—', tone: granted ? 'green' : 'neutral' }
          }),
        })
      })
      return {
        title: row.name,
        subtitle: `${row.perms} permissions · ${row.users} users`,
        sections,
      }
    },
  }
}
