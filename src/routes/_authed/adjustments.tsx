import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { AdjustStockModal } from '@/components/locations/AdjustStockModal'
import { createAdjustmentsConfig } from '@/entities/adjustments.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useMovements } from '@/hooks/queries/use-movements'
import { useCurrentBranch } from '@/hooks/queries/use-branches'

export const Route = createFileRoute('/_authed/adjustments')({
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: AdjustmentsPage,
})

function AdjustmentsPage() {
  const branch = useCurrentBranch()
  const { data: movements = [], isLoading } = useMovements()
  const rows = useMemo(() => movements.filter((m) => m.type === 'ADJUSTMENT'), [movements])
  const config = createAdjustmentsConfig(branch?.name ?? '')
  const [formOpen, setFormOpen] = useState(false)

  return (
    <>
      <EntityTableView config={config} rows={rows} isLoading={isLoading} onCreate={() => setFormOpen(true)} />
      <AdjustStockModal open={formOpen} onOpenChange={setFormOpen} />
    </>
  )
}
