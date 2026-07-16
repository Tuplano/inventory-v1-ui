import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { CompanyFormDialog } from '@/components/companies/CompanyFormDialog'
import { BranchFormDialog } from '@/components/companies/BranchFormDialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { createCompaniesConfig, type CompanyBranch, type CompanyRow } from '@/entities/companies.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useCompanyRows } from '@/hooks/queries/use-companies'
import { useDeleteCompany } from '@/hooks/mutations/use-delete-company'
import { useDeleteBranch } from '@/hooks/mutations/use-delete-branch'

export const Route = createFileRoute('/_authed/companies')({
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: CompaniesPage,
})

function CompaniesPage() {
  const { data: rows = [], isLoading } = useCompanyRows()
  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<CompanyRow | null>(null)
  const [branchDialogCompany, setBranchDialogCompany] = useState<CompanyRow | null>(null)
  const [branchToDelete, setBranchToDelete] = useState<CompanyBranch | null>(null)
  const deleteCompany = useDeleteCompany()
  const deleteBranch = useDeleteBranch()
  const config = createCompaniesConfig({ onAddBranch: setBranchDialogCompany, onDeleteBranch: setBranchToDelete })

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
        isDeleting={deleteCompany.isPending}
      />
      <CompanyFormDialog open={formOpen} onOpenChange={setFormOpen} company={editingRow} />
      <BranchFormDialog
        open={!!branchDialogCompany}
        onOpenChange={(open) => !open && setBranchDialogCompany(null)}
        company={branchDialogCompany}
      />
      <AlertDialog open={!!branchToDelete} onOpenChange={(open) => !open && setBranchToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {branchToDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteBranch.isPending}
              onClick={() => {
                if (!branchToDelete) return
                deleteBranch.mutate(
                  { branchId: branchToDelete.id, companyId: branchToDelete.companyId },
                  { onSuccess: () => setBranchToDelete(null) },
                )
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
