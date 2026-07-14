import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { createInventoryConfig } from '@/entities/inventory.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useInventory } from '@/hooks/queries/use-inventory'
import { useScopeStore } from '@/stores/scope-store'
import { mockStore } from '@/mock'

export const Route = createFileRoute('/_authed/inventory')({
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: InventoryPage,
})

function InventoryPage() {
  const branchId = useScopeStore((s) => s.branchId)
  const branch = mockStore.getBranch(branchId)
  const { data: rows = [], isLoading } = useInventory()
  const config = createInventoryConfig(branch?.name ?? '')

  return <EntityTableView config={config} rows={rows} isLoading={isLoading} />
}
