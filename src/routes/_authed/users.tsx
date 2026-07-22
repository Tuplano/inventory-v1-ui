import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { UserFormDialog } from '@/components/users/UserFormDialog'
import { InviteUserModal } from '@/components/users/InviteUserModal'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createUsersConfig, type UserRecord } from '@/entities/users.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useUsers } from '@/hooks/queries/use-users'
import { useCurrentCompany } from '@/hooks/queries/use-companies'
import { useDeleteUser } from '@/hooks/mutations/use-delete-user'
import { useInvites } from '@/hooks/queries/use-invites'
import { useRevokeInvite } from '@/hooks/mutations/use-revoke-invite'

export const Route = createFileRoute('/_authed/users')({
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: UsersPage,
})

function UsersPage() {
  const company = useCurrentCompany()
  const { data: rows = [], isLoading } = useUsers()
  const { data: invites = [] } = useInvites()
  const revokeInvite = useRevokeInvite()
  const config = createUsersConfig(company?.name ?? '', company?.code ?? '')
  const [formOpen, setFormOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<UserRecord | null>(null)
  const deleteUser = useDeleteUser()

  return (
    <>
      <EntityTableView
        config={config}
        rows={rows}
        isLoading={isLoading}
        onCreate={() => setInviteOpen(true)}
        onEditRow={(row) => {
          setEditingRow(row)
          setFormOpen(true)
        }}
        onDeleteRow={(row) => deleteUser.mutate(row.id)}
      />

      {invites.length > 0 && (
        <div className="-mt-2 px-6 pb-6">
          <Card className="overflow-hidden p-0">
            <div className="border-b border-[var(--border-2)] px-4 py-2.5 text-[13px] font-semibold">
              Pending invites ({invites.length})
            </div>
            <div className="divide-y divide-[var(--border-2)]">
              {invites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between px-4 py-2.5">
                  <div className="min-w-0">
                    <div className="truncate text-[12.5px] font-medium">{invite.email}</div>
                    <div className="text-[11px] text-[var(--text-3)]">
                      {invite.roleName} · {invite.hasAllBranches ? 'All branches' : invite.branchName} · expires{' '}
                      {invite.expiresAt.slice(0, 10)}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[var(--red)]"
                    onClick={() => revokeInvite.mutate(invite.id)}
                    disabled={revokeInvite.isPending}
                  >
                    <Trash2 data-icon="inline-start" />
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} user={editingRow} />
      <InviteUserModal open={inviteOpen} onOpenChange={setInviteOpen} />
    </>
  )
}
