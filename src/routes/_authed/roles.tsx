import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { createRolesConfig } from '@/entities/roles.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useRoles } from '@/hooks/queries/use-roles'
import { useScopeStore } from '@/stores/scope-store'
import { mockStore } from '@/mock'

export const Route = createFileRoute('/_authed/roles')({
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: RolesPage,
})

function RolesPage() {
  const companyId = useScopeStore((s) => s.companyId)
  const company = mockStore.getCompany(companyId)
  const { data: rows = [], isLoading } = useRoles()
  const config = createRolesConfig(company?.code ?? '')

  return <EntityTableView config={config} rows={rows} isLoading={isLoading} />
}
