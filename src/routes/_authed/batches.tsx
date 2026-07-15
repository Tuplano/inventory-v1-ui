import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { BatchFormDialog } from '@/components/batches/BatchFormDialog'
import { createBatchesConfig, type BatchRow } from '@/entities/batches.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useBatches } from '@/hooks/queries/use-batches'
import { useCurrentBranch } from '@/hooks/queries/use-branches'
import { useDeleteBatch } from '@/hooks/mutations/use-delete-batch'

export const Route = createFileRoute('/_authed/batches')({
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: BatchesPage,
})

function BatchesPage() {
  const branch = useCurrentBranch()
  const { data: rows = [], isLoading } = useBatches()
  const config = createBatchesConfig(branch?.name ?? '')
  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<BatchRow | null>(null)
  const deleteBatch = useDeleteBatch()

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
        onDeleteRow={(row) => deleteBatch.mutate(row.id)}
        isDeleting={deleteBatch.isPending}
      />
      <BatchFormDialog open={formOpen} onOpenChange={setFormOpen} batch={editingRow} />
    </>
  )
}
