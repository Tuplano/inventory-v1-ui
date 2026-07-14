import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { createInventoryConfig } from '@/entities/inventory.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useInventory } from '@/hooks/queries/use-inventory'
import { useCurrentBranch } from '@/hooks/queries/use-branches'

export const Route = createFileRoute('/_authed/inventory')({
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: InventoryPage,
})

function InventoryPage() {
  const branch = useCurrentBranch()
  const { data: rows = [], isLoading } = useInventory()
  const config = createInventoryConfig(branch?.name ?? '')

  return <EntityTableView config={config} rows={rows} isLoading={isLoading} />
}
