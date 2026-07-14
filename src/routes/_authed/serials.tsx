import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { createSerialsConfig } from '@/entities/serials.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useSerials } from '@/hooks/queries/use-serials'
import { useScopeStore } from '@/stores/scope-store'
import { mockStore } from '@/mock'

export const Route = createFileRoute('/_authed/serials')({
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: SerialsPage,
})

function SerialsPage() {
  const branchId = useScopeStore((s) => s.branchId)
  const branch = mockStore.getBranch(branchId)
  const { data: rows = [], isLoading } = useSerials()
  const config = createSerialsConfig(branch?.name ?? '')

  return <EntityTableView config={config} rows={rows} isLoading={isLoading} />
}
