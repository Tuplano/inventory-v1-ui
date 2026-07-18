import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { UomFormDialog } from '@/components/uom/UomFormDialog'
import { createUomConfig, type UomRecord } from '@/entities/uom.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useUoms } from '@/hooks/queries/use-uoms'
import { useCurrentCompany } from '@/hooks/queries/use-companies'
import { useDeleteUom } from '@/hooks/mutations/use-delete-uom'

export const Route = createFileRoute('/_authed/uom')({
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: UomPage,
})

function UomPage() {
  const company = useCurrentCompany()
  const { data: rows = [], isLoading } = useUoms()
  const config = createUomConfig(company?.code ?? '')
  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<UomRecord | null>(null)
  const deleteUom = useDeleteUom()

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
        onDeleteRow={(row) => deleteUom.mutate(row.id)}
      />
      <UomFormDialog open={formOpen} onOpenChange={setFormOpen} uom={editingRow} />
    </>
  )
}
