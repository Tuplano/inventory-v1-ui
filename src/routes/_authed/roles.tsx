import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { requirePermission } from '@/lib/route-guards'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { RoleFormDialog } from '@/components/roles/RoleFormDialog'
import { createRolesConfig, type RoleRow } from '@/entities/roles.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useRoles } from '@/hooks/queries/use-roles'
import { useCurrentCompany } from '@/hooks/queries/use-companies'
import { useDeleteRole } from '@/hooks/mutations/use-delete-role'
import { useAbility } from '@/hooks/use-ability'
import { canAny } from '@/lib/ability'

export const Route = createFileRoute('/_authed/roles')({
  beforeLoad: (opts) => requirePermission(opts, 'roles'),
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: RolesPage,
})

function RolesPage() {
  const company = useCurrentCompany()
  const { data: rows = [], isLoading } = useRoles()
  const config = createRolesConfig(company?.code ?? '')
  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<RoleRow | null>(null)
  const deleteRole = useDeleteRole()
  const ability = useAbility()
  const canManage = canAny(ability, ['roles.manage'])

  return (
    <>
      <EntityTableView
        config={config}
        rows={rows}
        isLoading={isLoading}
        canCreate={canManage}
        onCreate={() => {
          setEditingRow(null)
          setFormOpen(true)
        }}
        onEditRow={
          canManage
            ? (row) => {
                setEditingRow(row)
                setFormOpen(true)
              }
            : undefined
        }
        onDeleteRow={canManage ? (row) => deleteRole.mutate(row.id) : undefined}
      />
      <RoleFormDialog open={formOpen} onOpenChange={setFormOpen} role={editingRow} />
    </>
  )
}
