import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { createRolesConfig } from '@/entities/roles.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useRoles } from '@/hooks/queries/use-roles'
import { useCurrentCompany } from '@/hooks/queries/use-companies'

export const Route = createFileRoute('/_authed/roles')({
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: RolesPage,
})

function RolesPage() {
  const company = useCurrentCompany()
  const { data: rows = [], isLoading } = useRoles()
  const config = createRolesConfig(company?.code ?? '')

  return <EntityTableView config={config} rows={rows} isLoading={isLoading} />
}
