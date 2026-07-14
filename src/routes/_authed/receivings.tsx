import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { createReceivingsConfig } from '@/entities/receivings.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useReceivings } from '@/hooks/queries/use-receivings'
import { useCurrentBranch } from '@/hooks/queries/use-branches'

export const Route = createFileRoute('/_authed/receivings')({
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: ReceivingsPage,
})

function ReceivingsPage() {
  const branch = useCurrentBranch()
  const { data: rows = [], isLoading } = useReceivings()
  const config = createReceivingsConfig(branch?.name ?? '')

  return <EntityTableView config={config} rows={rows} isLoading={isLoading} />
}
