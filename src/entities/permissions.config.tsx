import type { EntityTableConfig, Tone } from './types'
import { MonoCell, ToneBadge } from '@/components/entity-table/cells'

/**
 * Static permission catalog entry from GET /api/v1/permissions
 * (matches the backend's PERMISSION_CATALOG shape). There is no `id` field —
 * `code` is the natural unique key.
 */
export interface PermissionCatalogRecord {
  code: string
  name: string
  description: string
  module: string
}

export interface PermissionRow extends PermissionCatalogRecord {
  /** Names of roles (in the current company) that have this permission granted. */
  grantedToRoles: string[]
}

const moduleTone: Record<string, Tone> = {
  roles: 'violet',
  company: 'accent',
  branch: 'teal',
  users: 'amber',
  inventory: 'green',
  procurement: 'red',
  tracking: 'neutral',
}

export function createPermissionsConfig(): EntityTableConfig<PermissionRow> {
  return {
    key: 'permissions',
    title: 'Permissions',
    subtitle: 'System permission catalog · assigned to roles',
    searchKeys: ['code', 'module', 'description'],
    getRowId: (row) => row.code,
    filters: [
      { key: 'all', label: 'All' },
      { key: 'roles', label: 'Roles', predicate: (r) => r.module === 'roles' },
      { key: 'company', label: 'Company', predicate: (r) => r.module === 'company' },
      { key: 'branch', label: 'Branch', predicate: (r) => r.module === 'branch' },
      { key: 'users', label: 'Users', predicate: (r) => r.module === 'users' },
      { key: 'inventory', label: 'Inventory', predicate: (r) => r.module === 'inventory' },
      { key: 'procurement', label: 'Procurement', predicate: (r) => r.module === 'procurement' },
      { key: 'tracking', label: 'Tracking', predicate: (r) => r.module === 'tracking' },
    ],
    columns: [
      { key: 'code', header: 'Permission code', sortable: true, sortValue: (r) => r.code, render: (r) => <MonoCell value={r.code} color="var(--brand-accent-d)" weight={600} /> },
      { key: 'module', header: 'Module', align: 'center', render: (r) => <ToneBadge tone={moduleTone[r.module] ?? 'neutral'} label={r.module} /> },
      { key: 'description', header: 'Description', render: (r) => <span className="text-[var(--text-2)]">{r.description}</span> },
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
            { label: 'Name', value: row.name },
            { label: 'Module', value: row.module },
            { label: 'Description', value: row.description },
          ],
        },
        {
          label: 'Granted to roles',
          rows:
            row.grantedToRoles.length > 0
              ? row.grantedToRoles.map((name) => ({ label: name, value: 'yes', tone: 'green' as const }))
              : [{ label: 'No roles', value: '—' }],
        },
      ],
    }),
  }
}
