import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { createBatchesConfig } from '@/entities/batches.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useBatches } from '@/hooks/queries/use-batches'
import { useCurrentBranch } from '@/hooks/queries/use-branches'

export const Route = createFileRoute('/_authed/batches')({
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: BatchesPage,
})

function BatchesPage() {
  const branch = useCurrentBranch()
  const { data: rows = [], isLoading } = useBatches()
  const config = createBatchesConfig(branch?.name ?? '')

  return <EntityTableView config={config} rows={rows} isLoading={isLoading} />
}
