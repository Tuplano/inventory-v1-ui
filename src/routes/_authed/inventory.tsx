import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { requirePermission } from '@/lib/route-guards'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { InventoryFormDialog } from '@/components/inventory/InventoryFormDialog'
import { createInventoryConfig, type InventoryRow } from '@/entities/inventory.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useInventory } from '@/hooks/queries/use-inventory'
import { useCurrentBranch } from '@/hooks/queries/use-branches'
import { useDeleteInventoryItem } from '@/hooks/mutations/use-delete-inventory-item'
import { useAbility } from '@/hooks/use-ability'
import { canAny } from '@/lib/ability'

export const Route = createFileRoute('/_authed/inventory')({
  beforeLoad: (opts) => requirePermission(opts, 'inventory'),
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: InventoryPage,
})

function InventoryPage() {
  const branch = useCurrentBranch()
  const { data: rows = [], isLoading } = useInventory()
  const config = createInventoryConfig(branch?.name ?? '')
  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<InventoryRow | null>(null)
  const deleteItem = useDeleteInventoryItem()
  const ability = useAbility()
  const canManage = canAny(ability, ['inventory.manage'])

  return (
    <>
      <EntityTableView
        config={config}
        rows={rows}
        isLoading={isLoading}
        onEditRow={
          canManage
            ? (row) => {
                setEditingRow(row)
                setFormOpen(true)
              }
            : undefined
        }
        onDeleteRow={canManage ? (row) => deleteItem.mutate(row.id) : undefined}
      />
      <InventoryFormDialog open={formOpen} onOpenChange={setFormOpen} item={editingRow} />
    </>
  )
}
