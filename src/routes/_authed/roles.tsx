import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { RoleFormDialog } from '@/components/roles/RoleFormDialog'
import { createRolesConfig, type RoleRow } from '@/entities/roles.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useRoles } from '@/hooks/queries/use-roles'
import { useCurrentCompany } from '@/hooks/queries/use-companies'
import { useDeleteRole } from '@/hooks/mutations/use-delete-role'

export const Route = createFileRoute('/_authed/roles')({
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

  return (
    <>
      <EntityTableView
        config={config}
        rows={rows}
        isLoading={isLoading}
        onCreate={() => {
          setEditingRow(null)
          setFormOpen(true)
        }}
        onEditRow={(row) => {
          setEditingRow(row)
          setFormOpen(true)
        }}
        onDeleteRow={(row) => deleteRole.mutate(row.id)}
        isDeleting={deleteRole.isPending}
      />
      <RoleFormDialog open={formOpen} onOpenChange={setFormOpen} role={editingRow} />
    </>
  )
}
