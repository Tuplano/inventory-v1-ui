import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { requirePermission } from '@/lib/route-guards'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { AdjustStockModal } from '@/components/locations/AdjustStockModal'
import { createAdjustmentsConfig } from '@/entities/adjustments.config'
import { entityTableSearchSchema, type EntityTableSearch } from '@/entities/types'
import { useMovements } from '@/hooks/queries/use-movements'
import { useCurrentBranch } from '@/hooks/queries/use-branches'
import { useCursorPager } from '@/hooks/use-cursor-pager'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useAbility } from '@/hooks/use-ability'
import { canAny } from '@/lib/ability'

export const Route = createFileRoute('/_authed/adjustments')({
  beforeLoad: (opts) => requirePermission(opts, 'adjustments'),
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: AdjustmentsPage,
})

function AdjustmentsPage() {
  const branch = useCurrentBranch()
  const search = useSearch({ strict: false }) as EntityTableSearch
  const navigate = useNavigate()
  const config = createAdjustmentsConfig(branch?.name ?? '')
  const [formOpen, setFormOpen] = useState(false)

  function setCursor(cursor: string | undefined) {
    navigate({ to: '.', search: (prev: Record<string, unknown>) => ({ ...prev, cursor }), replace: true })
  }

  const pager = useCursorPager(search.cursor, setCursor)
  const debouncedQ = useDebouncedValue(search.q ?? '')
  const activeFilter = config.filters?.find((f) => f.key === (search.filter ?? config.filters?.[0]?.key))
  const direction = activeFilter?.queryParam?.key === 'direction' ? (activeFilter.queryParam.value as 'INCREASE' | 'DECREASE') : undefined

  useEffect(() => {
    pager.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.filter, debouncedQ])

  const { data, isLoading } = useMovements({ type: ['ADJUSTMENT'], direction, q: debouncedQ, cursor: pager.cursor })
  const ability = useAbility()
  const canCreate = canAny(ability, ['product-locations.manage'])

  return (
    <>
      <EntityTableView
        config={config}
        rows={data?.rows ?? []}
        isLoading={isLoading}
        canCreate={canCreate}
        onCreate={() => setFormOpen(true)}
        serverPagination={{
          hasPrev: pager.hasPrev,
          hasNext: !!data?.nextCursor,
          onPrev: pager.goPrev,
          onNext: () => pager.goNext(data?.nextCursor ?? null),
        }}
      />
      <AdjustStockModal open={formOpen} onOpenChange={setFormOpen} />
    </>
  )
}
