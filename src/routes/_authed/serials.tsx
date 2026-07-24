import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { requirePermission } from '@/lib/route-guards'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { SerialFormDialog } from '@/components/serials/SerialFormDialog'
import { createSerialsConfig, type SerialRow } from '@/entities/serials.config'
import { entityTableSearchSchema, type EntityTableSearch, type SerialStatus } from '@/entities/types'
import { useSerials } from '@/hooks/queries/use-serials'
import { useCurrentBranch } from '@/hooks/queries/use-branches'
import { useDeleteSerial } from '@/hooks/mutations/use-delete-serial'
import { useCursorPager } from '@/hooks/use-cursor-pager'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useAbility } from '@/hooks/use-ability'
import { canAny } from '@/lib/ability'

export const Route = createFileRoute('/_authed/serials')({
  beforeLoad: (opts) => requirePermission(opts, 'serials'),
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: SerialsPage,
})

function SerialsPage() {
  const branch = useCurrentBranch()
  const search = useSearch({ strict: false }) as EntityTableSearch
  const navigate = useNavigate()
  const config = createSerialsConfig(branch?.name ?? '')
  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<SerialRow | null>(null)
  const deleteSerial = useDeleteSerial()

  function setCursor(cursor: string | undefined) {
    navigate({ to: '.', search: (prev: Record<string, unknown>) => ({ ...prev, cursor }), replace: true })
  }

  const pager = useCursorPager(search.cursor, setCursor)
  const debouncedQ = useDebouncedValue(search.q ?? '')
  const activeFilter = config.filters?.find((f) => f.key === (search.filter ?? config.filters?.[0]?.key))
  const status = activeFilter?.queryParam?.key === 'status' ? (activeFilter.queryParam.value as SerialStatus) : undefined

  useEffect(() => {
    pager.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.filter, debouncedQ])

  const { data, isLoading } = useSerials({ status, q: debouncedQ, cursor: pager.cursor })
  const ability = useAbility()
  const canManage = canAny(ability, ['serial-numbers.manage'])

  return (
    <>
      <EntityTableView
        config={config}
        rows={data?.rows ?? []}
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
        onDeleteRow={canManage ? (row) => deleteSerial.mutate(row.id) : undefined}
        serverPagination={{
          hasPrev: pager.hasPrev,
          hasNext: !!data?.nextCursor,
          onPrev: pager.goPrev,
          onNext: () => pager.goNext(data?.nextCursor ?? null),
        }}
      />
      <SerialFormDialog open={formOpen} onOpenChange={setFormOpen} serial={editingRow} />
    </>
  )
}
