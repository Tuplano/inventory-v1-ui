import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { MovementFormDialog } from '@/components/movements/MovementFormDialog'
import { createMovementsConfig } from '@/entities/movements.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useMovements } from '@/hooks/queries/use-movements'
import { useCurrentBranch } from '@/hooks/queries/use-branches'

export const Route = createFileRoute('/_authed/movements')({
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: MovementsPage,
})

function MovementsPage() {
  const branch = useCurrentBranch()
  const { data: rows = [], isLoading } = useMovements()
  const config = createMovementsConfig(branch?.name ?? '')
  const [formOpen, setFormOpen] = useState(false)

  return (
    <>
      <EntityTableView config={config} rows={rows} isLoading={isLoading} onCreate={() => setFormOpen(true)} />
      <MovementFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </>
  )
}
