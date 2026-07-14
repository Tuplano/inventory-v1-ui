import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { createConversionsConfig } from '@/entities/conversions.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useConversions } from '@/hooks/queries/use-conversions'
import { useScopeStore } from '@/stores/scope-store'
import { mockStore } from '@/mock'

export const Route = createFileRoute('/_authed/conversions')({
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: ConversionsPage,
})

function ConversionsPage() {
  const companyId = useScopeStore((s) => s.companyId)
  const company = mockStore.getCompany(companyId)
  const { data: rows = [], isLoading } = useConversions()
  const config = createConversionsConfig(company?.code ?? '')

  return <EntityTableView config={config} rows={rows} isLoading={isLoading} />
}
