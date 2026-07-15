import { z } from 'zod'
import type { DrawerSection, EntityTableConfig } from './types'

export const createRoleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  description: z.string().optional(),
})

export const updateRoleSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
})

export type CreateRoleInput = z.infer<typeof createRoleSchema>
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>

/**
 * Permission shape as embedded on a role by GET /api/v1/roles — note this one
 * carries a DB `id` (unlike the permission catalog record, which doesn't).
 */
export interface RolePermissionRecord {
  id: string
  code: string
  name: string
  description: string | null
  module: string | null
}

export interface RoleRecord {
  id: string
  companyId: string
  name: string
  code: string
  description: string | null
  isActive: boolean
  permissions: RolePermissionRecord[]
}

export interface RoleRow extends RoleRecord {
  /** Size of the full permission catalog, for the "granted / total" column. */
  totalPermissionCount: number
  /** Users assigned this role in this company, derived from /roles/assignments. */
  userCount: number
}

export function createRolesConfig(companyCode: string): EntityTableConfig<RoleRow> {
  return {
    key: 'roles',
    title: 'Roles & permissions',
    subtitle: `RBAC scoped to ${companyCode}`,
    primaryActionLabel: 'New role',
    searchKeys: ['name', 'description'],
    getRowId: (row) => row.id,
    columns: [
      { key: 'name', header: 'Role', sortable: true, sortValue: (r) => r.name, render: (r) => <span className="font-semibold">{r.name}</span> },
      { key: 'description', header: 'Description', render: (r) => <span className="text-[var(--text-2)]">{r.description ?? '—'}</span> },
      {
        key: 'permissions',
        header: 'Permissions',
        render: (r) => (
          <span className="font-mono text-[12px] text-[var(--brand-accent-d)]">
            {r.permissions.length} / {r.totalPermissionCount}
          </span>
        ),
      },
      { key: 'userCount', header: 'Users', render: (r) => <span className="font-mono text-[12px]">{r.userCount}</span> },
    ],
    drawer: (row) => {
      const grouped: Record<string, RolePermissionRecord[]> = {}
      row.permissions.forEach((p) => {
        const moduleKey = p.module ?? 'other'
        ;(grouped[moduleKey] ??= []).push(p)
      })
      const sections: DrawerSection[] = [
        { label: 'Description', rows: [{ label: 'Summary', value: row.description ?? '—' }] },
      ]
      Object.entries(grouped).forEach(([module, perms]) => {
        sections.push({
          label: module,
          rows: perms.map((p) => ({ label: p.code, value: 'granted', tone: 'green' as const })),
        })
      })
      return {
        title: row.name,
        subtitle: `${row.permissions.length} permissions · ${row.userCount} users`,
        badge: { label: row.isActive ? 'Active' : 'Inactive', tone: row.isActive ? 'green' : 'neutral' },
        sections,
      }
    },
  }
}
