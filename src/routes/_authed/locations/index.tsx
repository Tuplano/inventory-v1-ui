import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { requirePermission } from '@/lib/route-guards'
import { Inbox } from 'lucide-react'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { LocationFormDialog } from '@/components/locations/LocationFormDialog'
import { Card } from '@/components/ui/card'
import { createLocationsConfig } from '@/entities/locations.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useLocations } from '@/hooks/queries/use-locations'
import { useUnplacedStock } from '@/hooks/queries/use-unplaced-stock'
import { useCurrentBranch } from '@/hooks/queries/use-branches'
import { useAbility } from '@/hooks/use-ability'
import { canAny } from '@/lib/ability'

export const Route = createFileRoute('/_authed/locations/')({
  beforeLoad: (opts) => requirePermission(opts, 'locations'),
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: LocationsPage,
})

function LocationsPage() {
  const branch = useCurrentBranch()
  const { data: rows = [], isLoading } = useLocations()
  const { data: unplacedStock = [] } = useUnplacedStock()
  const config = createLocationsConfig(branch?.name ?? '')
  const [formOpen, setFormOpen] = useState(false)
  const ability = useAbility()
  const canManage = canAny(ability, ['product-locations.manage'])

  const unplacedProductCount = new Set(unplacedStock.map((c) => c.productId)).size
  const unplacedUnitCount = unplacedStock.reduce((sum, c) => sum + c.quantity, 0)

  return (
    <>
      {unplacedStock.length > 0 && (
        <Card className="mx-6 mt-4 flex-row items-center gap-3 border border-[var(--amber)]/30 bg-[var(--amber)]/8 p-3.5">
          <Inbox className="size-4 shrink-0 text-[var(--amber)]" />
          <div className="flex-1 text-[12.5px] text-[var(--text-2)]">
            <span className="font-semibold">{unplacedUnitCount.toLocaleString()} unit(s)</span> across{' '}
            {unplacedProductCount.toLocaleString()} product(s) were received without a location and haven't been placed yet.
            {rows.length > 0 && (
              <>
                {' '}
                Open a location and use <span className="font-semibold">Place received stock</span> to assign it.
              </>
            )}
          </div>
        </Card>
      )}
      <EntityTableView
        config={config}
        rows={rows}
        isLoading={isLoading}
        canCreate={canManage}
        onCreate={() => setFormOpen(true)}
      />
      <LocationFormDialog open={formOpen} onOpenChange={setFormOpen} location={null} />
    </>
  )
}
