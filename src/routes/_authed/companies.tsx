import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { requirePermission } from '@/lib/route-guards'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { CompanyFormDialog } from '@/components/companies/CompanyFormDialog'
import { BranchFormDialog } from '@/components/companies/BranchFormDialog'
import { createCompaniesConfig, type CompanyBranch, type CompanyRow } from '@/entities/companies.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useCompanyRows } from '@/hooks/queries/use-companies'
import { useDeleteCompany } from '@/hooks/mutations/use-delete-company'
import { useDeleteBranch } from '@/hooks/mutations/use-delete-branch'
import { confirm } from '@/lib/confirm'
import { useAbility } from '@/hooks/use-ability'
import { canAny } from '@/lib/ability'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/_authed/companies')({
  beforeLoad: (opts) => requirePermission(opts, 'companies'),
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: CompaniesPage,
})

function CompaniesPage() {
  const { data: rows = [], isLoading } = useCompanyRows()
  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<CompanyRow | null>(null)
  const [branchDialogCompany, setBranchDialogCompany] = useState<CompanyRow | null>(null)
  const deleteCompany = useDeleteCompany()
  const deleteBranch = useDeleteBranch()
  const ability = useAbility()
  const { user } = useAuthStore()
  // Creating/deleting a company is a global-ADMIN-only action on the API — no permission code gates it.
  const isAdmin = user?.role === 'ADMIN'
  const canManageCompany = canAny(ability, ['company.manage'])
  const canManageBranches = canAny(ability, ['branches.manage'])

  async function handleDeleteBranch(branch: CompanyBranch) {
    const ok = await confirm({ title: `Delete ${branch.name}?`, description: 'This action cannot be undone.' })
    if (ok) deleteBranch.mutate({ branchId: branch.id, companyId: branch.companyId })
  }

  const config = createCompaniesConfig({
    onAddBranch: setBranchDialogCompany,
    onDeleteBranch: handleDeleteBranch,
    canManageBranches,
  })

  return (
    <>
      <EntityTableView
        config={config}
        rows={rows}
        isLoading={isLoading}
        canCreate={isAdmin}
        onCreate={() => {
          setEditingRow(null)
          setFormOpen(true)
        }}
        onEditRow={
          canManageCompany
            ? (row) => {
                setEditingRow(row)
                setFormOpen(true)
              }
            : undefined
        }
        onDeleteRow={isAdmin ? (row) => deleteCompany.mutate(row.id) : undefined}
      />
      <CompanyFormDialog open={formOpen} onOpenChange={setFormOpen} company={editingRow} />
      <BranchFormDialog
        open={!!branchDialogCompany}
        onOpenChange={(open) => !open && setBranchDialogCompany(null)}
        company={branchDialogCompany}
      />
    </>
  )
}
