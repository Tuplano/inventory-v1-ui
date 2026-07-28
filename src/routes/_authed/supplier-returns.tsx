import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { requirePermission } from '@/lib/route-guards'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { createSupplierReturnsConfig } from '@/entities/supplier-returns.config'
import { entityTableSearchSchema, type EntityTableSearch } from '@/entities/types'
import { useSupplierReturns } from '@/hooks/queries/use-supplier-returns'
import { useCurrentBranch } from '@/hooks/queries/use-branches'
import { useCursorPager } from '@/hooks/use-cursor-pager'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useAbility } from '@/hooks/use-ability'
import { canAny } from '@/lib/ability'
import { CreateSupplierReturnDialog } from '@/components/purchase-orders/CreateSupplierReturnDialog'

export const Route = createFileRoute('/_authed/supplier-returns')({
  beforeLoad: (opts) => requirePermission(opts, 'supplier-returns'),
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: SupplierReturnsPage,
})

function SupplierReturnsPage() {
  const branch = useCurrentBranch()
  const search = useSearch({ strict: false }) as EntityTableSearch
  const navigate = useNavigate()
  const config = createSupplierReturnsConfig(branch?.name ?? '')

  function setCursor(cursor: string | undefined) {
    navigate({ to: '.', search: (prev: Record<string, unknown>) => ({ ...prev, cursor }), replace: true })
  }

  const pager = useCursorPager(search.cursor, setCursor)
  const debouncedQ = useDebouncedValue(search.q ?? '')

  useEffect(() => {
    pager.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ])

  const { data, isLoading } = useSupplierReturns({ q: debouncedQ, cursor: pager.cursor })
  const ability = useAbility()
  const canReturn = canAny(ability, ['supplier-returns.manage'])
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <>
      <EntityTableView
        config={config}
        rows={data?.rows ?? []}
        isLoading={isLoading}
        canCreate={canReturn}
        onCreate={() => setCreateOpen(true)}
        serverPagination={{
          hasPrev: pager.hasPrev,
          hasNext: !!data?.nextCursor,
          onPrev: pager.goPrev,
          onNext: () => pager.goNext(data?.nextCursor ?? null),
        }}
      />
      <CreateSupplierReturnDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  )
}
