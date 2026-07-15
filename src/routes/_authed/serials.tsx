import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { SerialFormDialog } from '@/components/serials/SerialFormDialog'
import { createSerialsConfig, type SerialRow } from '@/entities/serials.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useSerials } from '@/hooks/queries/use-serials'
import { useCurrentBranch } from '@/hooks/queries/use-branches'
import { useDeleteSerial } from '@/hooks/mutations/use-delete-serial'

export const Route = createFileRoute('/_authed/serials')({
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: SerialsPage,
})

function SerialsPage() {
  const branch = useCurrentBranch()
  const { data: rows = [], isLoading } = useSerials()
  const config = createSerialsConfig(branch?.name ?? '')
  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<SerialRow | null>(null)
  const deleteSerial = useDeleteSerial()

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
        onDeleteRow={(row) => deleteSerial.mutate(row.id)}
        isDeleting={deleteSerial.isPending}
      />
      <SerialFormDialog open={formOpen} onOpenChange={setFormOpen} serial={editingRow} />
    </>
  )
}
