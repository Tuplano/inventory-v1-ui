import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { createUsersConfig } from '@/entities/users.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useUsers } from '@/hooks/queries/use-users'
import { useScopeStore } from '@/stores/scope-store'
import { mockStore } from '@/mock'

export const Route = createFileRoute('/_authed/users')({
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: UsersPage,
})

function UsersPage() {
  const companyId = useScopeStore((s) => s.companyId)
  const company = mockStore.getCompany(companyId)
  const { data: rows = [], isLoading } = useUsers()
  const config = createUsersConfig(company?.name ?? '', company?.code ?? '')

  return <EntityTableView config={config} rows={rows} isLoading={isLoading} />
}
