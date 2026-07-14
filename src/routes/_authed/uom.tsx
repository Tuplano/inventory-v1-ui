import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { createUomConfig } from '@/entities/uom.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useUoms } from '@/hooks/queries/use-uoms'
import { useScopeStore } from '@/stores/scope-store'
import { mockStore } from '@/mock'

export const Route = createFileRoute('/_authed/uom')({
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: UomPage,
})

function UomPage() {
  const companyId = useScopeStore((s) => s.companyId)
  const company = mockStore.getCompany(companyId)
  const { data: rows = [], isLoading } = useUoms()
  const config = createUomConfig(company?.code ?? '')

  return <EntityTableView config={config} rows={rows} isLoading={isLoading} />
}
