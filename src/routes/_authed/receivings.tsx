import { useEffect } from 'react'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { requirePermission } from '@/lib/route-guards'
import { toast } from 'sonner'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { createReceivingsConfig } from '@/entities/receivings.config'
import { entityTableSearchSchema, type EntityTableSearch } from '@/entities/types'
import { useReceivings } from '@/hooks/queries/use-receivings'
import { useCurrentBranch } from '@/hooks/queries/use-branches'
import { useCursorPager } from '@/hooks/use-cursor-pager'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useAbility } from '@/hooks/use-ability'
import { canAny } from '@/lib/ability'

export const Route = createFileRoute('/_authed/receivings')({
  beforeLoad: (opts) => requirePermission(opts, 'receivings'),
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: ReceivingsPage,
})

function ReceivingsPage() {
  const branch = useCurrentBranch()
  const search = useSearch({ strict: false }) as EntityTableSearch
  const navigate = useNavigate()
  const config = createReceivingsConfig(branch?.name ?? '')

  function setCursor(cursor: string | undefined) {
    navigate({ to: '.', search: (prev: Record<string, unknown>) => ({ ...prev, cursor }), replace: true })
  }

  const pager = useCursorPager(search.cursor, setCursor)
  const debouncedQ = useDebouncedValue(search.q ?? '')

  useEffect(() => {
    pager.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ])

  const { data, isLoading } = useReceivings({ q: debouncedQ, cursor: pager.cursor })
  const ability = useAbility()
  const canReceive = canAny(ability, ['purchase-orders.receive'])

  return (
    <EntityTableView
      config={config}
      rows={data?.rows ?? []}
      isLoading={isLoading}
      canCreate={canReceive}
      onCreate={() => {
        toast('Select a confirmed purchase order to receive stock against')
        navigate({ to: '/purchase-orders' })
      }}
      serverPagination={{
        hasPrev: pager.hasPrev,
        hasNext: !!data?.nextCursor,
        onPrev: pager.goPrev,
        onNext: () => pager.goNext(data?.nextCursor ?? null),
      }}
    />
  )
}
