import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { UserFormDialog } from '@/components/users/UserFormDialog'
import { createUsersConfig, type UserRecord } from '@/entities/users.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useUsers } from '@/hooks/queries/use-users'
import { useCurrentCompany } from '@/hooks/queries/use-companies'
import { useDeleteUser } from '@/hooks/mutations/use-delete-user'

export const Route = createFileRoute('/_authed/users')({
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: UsersPage,
})

function UsersPage() {
  const company = useCurrentCompany()
  const { data: rows = [], isLoading } = useUsers()
  const config = createUsersConfig(company?.name ?? '', company?.code ?? '')
  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<UserRecord | null>(null)
  const deleteUser = useDeleteUser()

  return (
    <>
      <EntityTableView
        config={config}
        rows={rows}
        isLoading={isLoading}
        onEditRow={(row) => {
          setEditingRow(row)
          setFormOpen(true)
        }}
        onDeleteRow={(row) => deleteUser.mutate(row.id)}
      />
      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} user={editingRow} />
    </>
  )
}
