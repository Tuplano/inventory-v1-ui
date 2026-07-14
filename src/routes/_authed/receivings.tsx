import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { createReceivingsConfig } from '@/entities/receivings.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useReceivings } from '@/hooks/queries/use-receivings'
import { useScopeStore } from '@/stores/scope-store'
import { mockStore } from '@/mock'

export const Route = createFileRoute('/_authed/receivings')({
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: ReceivingsPage,
})

function ReceivingsPage() {
  const branchId = useScopeStore((s) => s.branchId)
  const branch = mockStore.getBranch(branchId)
  const { data: rows = [], isLoading } = useReceivings()
  const config = createReceivingsConfig(branch?.name ?? '')

  return <EntityTableView config={config} rows={rows} isLoading={isLoading} />
}
