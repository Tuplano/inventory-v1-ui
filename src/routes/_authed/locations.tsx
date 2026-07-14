import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { createLocationsConfig } from '@/entities/locations.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useLocations } from '@/hooks/queries/use-locations'
import { useScopeStore } from '@/stores/scope-store'
import { mockStore } from '@/mock'

export const Route = createFileRoute('/_authed/locations')({
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: LocationsPage,
})

function LocationsPage() {
  const branchId = useScopeStore((s) => s.branchId)
  const branch = mockStore.getBranch(branchId)
  const { data: rows = [], isLoading } = useLocations()
  const config = createLocationsConfig(branch?.name ?? '')

  return <EntityTableView config={config} rows={rows} isLoading={isLoading} />
}
