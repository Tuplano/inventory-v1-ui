import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { createPurchaseOrdersConfig } from '@/entities/purchase-orders.config'
import { entityTableSearchSchema } from '@/entities/types'
import { usePurchaseOrders } from '@/hooks/queries/use-purchase-orders'
import { useScopeStore } from '@/stores/scope-store'
import { mockStore } from '@/mock'

export const Route = createFileRoute('/_authed/purchase-orders/')({
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: PurchaseOrdersPage,
})

function PurchaseOrdersPage() {
  const branchId = useScopeStore((s) => s.branchId)
  const branch = mockStore.getBranch(branchId)
  const { data: rows = [], isLoading } = usePurchaseOrders()
  const config = createPurchaseOrdersConfig(branch?.name ?? '')

  return <EntityTableView config={config} rows={rows} isLoading={isLoading} />
}
