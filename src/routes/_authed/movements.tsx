import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { createMovementsConfig } from '@/entities/movements.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useMovements } from '@/hooks/queries/use-movements'
import { useScopeStore } from '@/stores/scope-store'
import { mockStore } from '@/mock'

export const Route = createFileRoute('/_authed/movements')({
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: MovementsPage,
})

function MovementsPage() {
  const branchId = useScopeStore((s) => s.branchId)
  const branch = mockStore.getBranch(branchId)
  const { data: rows = [], isLoading } = useMovements()
  const config = createMovementsConfig(branch?.name ?? '')

  return <EntityTableView config={config} rows={rows} isLoading={isLoading} />
}
