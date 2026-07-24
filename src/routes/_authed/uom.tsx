import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { requirePermission } from '@/lib/route-guards'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { UomFormDialog } from '@/components/uom/UomFormDialog'
import { createUomConfig, type UomRecord } from '@/entities/uom.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useAbility } from '@/hooks/use-ability'
import { canAny } from '@/lib/ability'
import { useUoms } from '@/hooks/queries/use-uoms'
import { useCurrentCompany } from '@/hooks/queries/use-companies'
import { useDeleteUom } from '@/hooks/mutations/use-delete-uom'

export const Route = createFileRoute('/_authed/uom')({
  beforeLoad: (opts) => requirePermission(opts, 'uom'),
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: UomPage,
})

function UomPage() {
  const company = useCurrentCompany()
  const { data: rows = [], isLoading } = useUoms()
  const config = createUomConfig(company?.code ?? '')
  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<UomRecord | null>(null)
  const deleteUom = useDeleteUom()
  const ability = useAbility()
  const canManage = canAny(ability, ['uom.manage'])

  return (
    <>
      <EntityTableView
        config={config}
        rows={rows}
        isLoading={isLoading}
        canCreate={canManage}
        onCreate={() => {
          setEditingRow(null)
          setFormOpen(true)
        }}
        onEditRow={
          canManage
            ? (row) => {
                setEditingRow(row)
                setFormOpen(true)
              }
            : undefined
        }
        onDeleteRow={canManage ? (row) => deleteUom.mutate(row.id) : undefined}
      />
      <UomFormDialog open={formOpen} onOpenChange={setFormOpen} uom={editingRow} />
    </>
  )
}
