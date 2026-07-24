import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { requirePermission } from '@/lib/route-guards'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { MovementFormDialog } from '@/components/movements/MovementFormDialog'
import { createMovementsConfig } from '@/entities/movements.config'
import { entityTableSearchSchema, type EntityTableSearch, type MovementType } from '@/entities/types'
import { useMovements } from '@/hooks/queries/use-movements'
import { useCurrentBranch } from '@/hooks/queries/use-branches'
import { useCursorPager } from '@/hooks/use-cursor-pager'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useAbility } from '@/hooks/use-ability'
import { canAny } from '@/lib/ability'

export const Route = createFileRoute('/_authed/movements')({
  beforeLoad: (opts) => requirePermission(opts, 'movements'),
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: MovementsPage,
})

function MovementsPage() {
  const branch = useCurrentBranch()
  const search = useSearch({ strict: false }) as EntityTableSearch
  const navigate = useNavigate()
  const config = createMovementsConfig(branch?.name ?? '')
  const [formOpen, setFormOpen] = useState(false)

  function setCursor(cursor: string | undefined) {
    navigate({ to: '.', search: (prev: Record<string, unknown>) => ({ ...prev, cursor }), replace: true })
  }

  const pager = useCursorPager(search.cursor, setCursor)
  const debouncedQ = useDebouncedValue(search.q ?? '')
  const activeFilter = config.filters?.find((f) => f.key === (search.filter ?? config.filters?.[0]?.key))
  const type =
    activeFilter?.queryParam?.key === 'type' ? (activeFilter.queryParam.value.split(',') as MovementType[]) : undefined

  // Changing what's being asked for invalidates the cursor stack — the "next" page under the old
  // filter/search isn't the "next" page under the new one.
  useEffect(() => {
    pager.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.filter, debouncedQ])

  const { data, isLoading } = useMovements({ type, q: debouncedQ, cursor: pager.cursor })
  const ability = useAbility()
  const canCreate = canAny(ability, ['stock-movements.create'])

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
      <MovementFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </>
  )
}
