import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { createPermissionsConfig } from '@/entities/permissions.config'
import { entityTableSearchSchema } from '@/entities/types'
import { usePermissions } from '@/hooks/queries/use-permissions'

export const Route = createFileRoute('/_authed/permissions')({
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: PermissionsPage,
})

function PermissionsPage() {
  const { data: rows = [], isLoading } = usePermissions()
  const config = createPermissionsConfig()

  return <EntityTableView config={config} rows={rows} isLoading={isLoading} />
}
