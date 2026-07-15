import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { PoFormDialog } from '@/components/purchase-orders/PoFormDialog'
import { createPurchaseOrdersConfig } from '@/entities/purchase-orders.config'
import { entityTableSearchSchema } from '@/entities/types'
import { usePurchaseOrders } from '@/hooks/queries/use-purchase-orders'
import { useCurrentBranch } from '@/hooks/queries/use-branches'

export const Route = createFileRoute('/_authed/purchase-orders/')({
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: PurchaseOrdersPage,
})

function PurchaseOrdersPage() {
  const branch = useCurrentBranch()
  const { data: rows = [], isLoading } = usePurchaseOrders()
  const config = createPurchaseOrdersConfig(branch?.name ?? '')
  const [formOpen, setFormOpen] = useState(false)

  return (
    <>
      <EntityTableView config={config} rows={rows} isLoading={isLoading} onCreate={() => setFormOpen(true)} />
      <PoFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </>
  )
}
