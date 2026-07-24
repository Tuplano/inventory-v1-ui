import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { requirePermission } from '@/lib/route-guards'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { BatchFormDialog } from '@/components/batches/BatchFormDialog'
import { createBatchesConfig, type BatchRow } from '@/entities/batches.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useAbility } from '@/hooks/use-ability'
import { canAny } from '@/lib/ability'
import { useBatches } from '@/hooks/queries/use-batches'
import { useCurrentBranch } from '@/hooks/queries/use-branches'
import { useDeleteBatch } from '@/hooks/mutations/use-delete-batch'

export const Route = createFileRoute('/_authed/batches')({
  beforeLoad: (opts) => requirePermission(opts, 'batches'),
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
  const ability = useAbility()
  const canManage = canAny(ability, ['batches.manage'])

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
        onDeleteRow={canManage ? (row) => deleteBatch.mutate(row.id) : undefined}
      />
      <BatchFormDialog open={formOpen} onOpenChange={setFormOpen} batch={editingRow} />
    </>
  )
}
