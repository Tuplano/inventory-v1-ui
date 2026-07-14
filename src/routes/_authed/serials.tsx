import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { createSerialsConfig } from '@/entities/serials.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useSerials } from '@/hooks/queries/use-serials'
import { useCurrentBranch } from '@/hooks/queries/use-branches'

export const Route = createFileRoute('/_authed/serials')({
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: SerialsPage,
})

function SerialsPage() {
  const branch = useCurrentBranch()
  const { data: rows = [], isLoading } = useSerials()
  const config = createSerialsConfig(branch?.name ?? '')

  return <EntityTableView config={config} rows={rows} isLoading={isLoading} />
}
