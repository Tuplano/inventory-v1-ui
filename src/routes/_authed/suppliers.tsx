import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { SupplierFormDialog } from '@/components/suppliers/SupplierFormDialog'
import { createSuppliersConfig, type SupplierRecord } from '@/entities/suppliers.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useSuppliers } from '@/hooks/queries/use-suppliers'
import { useCurrentCompany } from '@/hooks/queries/use-companies'

export const Route = createFileRoute('/_authed/suppliers')({
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: SuppliersPage,
})

function SuppliersPage() {
  const company = useCurrentCompany()
  const { data: rows = [], isLoading } = useSuppliers()
  const config = createSuppliersConfig(company?.code ?? '')
  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<SupplierRecord | null>(null)

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
      />
      <SupplierFormDialog open={formOpen} onOpenChange={setFormOpen} supplier={editingRow} />
    </>
  )
}
