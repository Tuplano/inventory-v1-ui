import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { requirePermission } from '@/lib/route-guards'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { BomFormDialog } from '@/components/boms/BomFormDialog'
import { createBomsConfig } from '@/entities/boms.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useBoms } from '@/hooks/queries/use-boms'
import { useCurrentBranch } from '@/hooks/queries/use-branches'
import { useAbility } from '@/hooks/use-ability'
import { canAny } from '@/lib/ability'

export const Route = createFileRoute('/_authed/boms/')({
  beforeLoad: (opts) => requirePermission(opts, 'boms'),
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: BomsPage,
})

function BomsPage() {
  const branch = useCurrentBranch()
  const { data: rows = [], isLoading } = useBoms()
  const config = createBomsConfig(branch?.name ?? '')
  const [formOpen, setFormOpen] = useState(false)
  const ability = useAbility()
  const canManage = canAny(ability, ['bom.manage'])

  return (
    <>
      <EntityTableView
        config={config}
        rows={rows}
        isLoading={isLoading}
        canCreate={canManage}
        onCreate={() => setFormOpen(true)}
      />
      <BomFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </>
  )
}
