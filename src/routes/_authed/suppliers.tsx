import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { requirePermission } from '@/lib/route-guards'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { SupplierFormDialog } from '@/components/suppliers/SupplierFormDialog'
import { createSuppliersConfig, type SupplierRecord } from '@/entities/suppliers.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useAbility } from '@/hooks/use-ability'
import { canAny } from '@/lib/ability'
import { useSuppliers } from '@/hooks/queries/use-suppliers'
import { useCurrentCompany } from '@/hooks/queries/use-companies'
import { useDeleteSupplier } from '@/hooks/mutations/use-delete-supplier'

export const Route = createFileRoute('/_authed/suppliers')({
  beforeLoad: (opts) => requirePermission(opts, 'suppliers'),
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: SuppliersPage,
})

function SuppliersPage() {
  const company = useCurrentCompany()
  const { data: rows = [], isLoading } = useSuppliers()
  const config = createSuppliersConfig(company?.code ?? '')
  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<SupplierRecord | null>(null)
  const deleteSupplier = useDeleteSupplier()
  const ability = useAbility()
  const canManage = canAny(ability, ['suppliers.manage'])

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
        onDeleteRow={canManage ? (row) => deleteSupplier.mutate(row.id) : undefined}
      />
      <SupplierFormDialog open={formOpen} onOpenChange={setFormOpen} supplier={editingRow} />
    </>
  )
}
