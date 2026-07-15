import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { LocationFormDialog } from '@/components/locations/LocationFormDialog'
import { createLocationsConfig, type ProductLocationRecord } from '@/entities/locations.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useLocations } from '@/hooks/queries/use-locations'
import { useCurrentBranch } from '@/hooks/queries/use-branches'
import { useDeleteLocation } from '@/hooks/mutations/use-delete-location'

export const Route = createFileRoute('/_authed/locations')({
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: LocationsPage,
})

function LocationsPage() {
  const branch = useCurrentBranch()
  const { data: rows = [], isLoading } = useLocations()
  const config = createLocationsConfig(branch?.name ?? '')
  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<ProductLocationRecord | null>(null)
  const deleteLocation = useDeleteLocation()

  return (
    <>
      <EntityTableView
        config={config}
        rows={rows}
        isLoading={isLoading}
        onCreate={() => {
          setEditingRow(null)
          setFormOpen(true)
        }}
        onEditRow={(row) => {
          setEditingRow(row)
          setFormOpen(true)
        }}
        onDeleteRow={(row) => deleteLocation.mutate(row.id)}
        isDeleting={deleteLocation.isPending}
      />
      <LocationFormDialog open={formOpen} onOpenChange={setFormOpen} location={editingRow} />
    </>
  )
}
