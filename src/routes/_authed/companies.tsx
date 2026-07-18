import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { CompanyFormDialog } from '@/components/companies/CompanyFormDialog'
import { BranchFormDialog } from '@/components/companies/BranchFormDialog'
import { createCompaniesConfig, type CompanyBranch, type CompanyRow } from '@/entities/companies.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useCompanyRows } from '@/hooks/queries/use-companies'
import { useDeleteCompany } from '@/hooks/mutations/use-delete-company'
import { useDeleteBranch } from '@/hooks/mutations/use-delete-branch'
import { confirm } from '@/lib/confirm'

export const Route = createFileRoute('/_authed/companies')({
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

  async function handleDeleteBranch(branch: CompanyBranch) {
    const ok = await confirm({ title: `Delete ${branch.name}?`, description: 'This action cannot be undone.' })
    if (ok) deleteBranch.mutate({ branchId: branch.id, companyId: branch.companyId })
  }

  const config = createCompaniesConfig({ onAddBranch: setBranchDialogCompany, onDeleteBranch: handleDeleteBranch })

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
        onDeleteRow={(row) => deleteCompany.mutate(row.id)}
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
