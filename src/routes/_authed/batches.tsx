import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { createBatchesConfig } from '@/entities/batches.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useBatches } from '@/hooks/queries/use-batches'
import { useScopeStore } from '@/stores/scope-store'
import { mockStore } from '@/mock'

export const Route = createFileRoute('/_authed/batches')({
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: BatchesPage,
})

function BatchesPage() {
  const branchId = useScopeStore((s) => s.branchId)
  const branch = mockStore.getBranch(branchId)
  const { data: rows = [], isLoading } = useBatches()
  const config = createBatchesConfig(branch?.name ?? '')

  return <EntityTableView config={config} rows={rows} isLoading={isLoading} />
}
