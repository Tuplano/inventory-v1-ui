import type { EntityTableConfig } from './types'
import type { Permission, Role, Tone } from '@/mock/types'
import { MonoCell, ToneBadge } from '@/components/entity-table/cells'

export interface PermissionRow extends Permission {
  sampleRoles: Role[]
}

const moduleTone: Record<string, Tone> = {
  Inventory: 'accent',
  Catalog: 'teal',
  Purchasing: 'amber',
  Admin: 'violet',
}

export function createPermissionsConfig(): EntityTableConfig<PermissionRow> {
  return {
    key: 'permissions',
    title: 'Permissions',
    subtitle: 'System permission catalog · assigned to roles',
    searchKeys: ['code', 'module', 'desc'],
    getRowId: (row) => row.id,
    filters: [
      { key: 'all', label: 'All' },
      { key: 'Inventory', label: 'Inventory', predicate: (r) => r.module === 'Inventory' },
      { key: 'Catalog', label: 'Catalog', predicate: (r) => r.module === 'Catalog' },
      { key: 'Purchasing', label: 'Purchasing', predicate: (r) => r.module === 'Purchasing' },
      { key: 'Admin', label: 'Admin', predicate: (r) => r.module === 'Admin' },
    ],
    columns: [
      { key: 'code', header: 'Permission code', sortable: true, sortValue: (r) => r.code, render: (r) => <MonoCell value={r.code} color="var(--brand-accent-d)" weight={600} /> },
      { key: 'module', header: 'Module', align: 'center', render: (r) => <ToneBadge tone={moduleTone[r.module] ?? 'neutral'} label={r.module} /> },
      { key: 'desc', header: 'Description', render: (r) => <span className="text-[var(--text-2)]">{r.desc}</span> },
    ],
    drawer: (row) => ({
      title: row.code,
      subtitle: row.module,
      badge: { label: row.module, tone: moduleTone[row.module] ?? 'neutral' },
      sections: [
        {
          label: 'Permission',
          rows: [
            { label: 'Code', value: row.code },
            { label: 'Module', value: row.module },
            { label: 'Description', value: row.desc },
          ],
        },
        {
          label: 'Granted to roles',
          rows: row.sampleRoles.map((r) => ({ label: r.name, value: 'yes', tone: 'green' as const })),
        },
      ],
    }),
  }
}
