import { useMemo, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { RecordDrawer } from '@/components/record-drawer/RecordDrawer'
import type { EntityTableConfig, EntityTableSearch } from '@/entities/types'

const PAGE_SIZE_DEFAULT = 25

export function EntityTableView<TRow>({
  config,
  rows,
  isLoading,
}: {
  config: EntityTableConfig<TRow>
  rows: TRow[]
  isLoading?: boolean
}) {
  const search = useSearch({ strict: false }) as EntityTableSearch
  const navigate = useNavigate()
  const [localPage, setLocalPage] = useState(1)

  function setSearch(patch: Partial<EntityTableSearch>) {
    navigate({
      to: '.',
      search: (prev: Record<string, unknown>) => ({ ...prev, ...patch }),
      replace: true,
    })
  }

  const activeFilter = search.filter ?? config.filters?.[0]?.key ?? 'all'
  const pageSize = config.pageSize ?? PAGE_SIZE_DEFAULT

  const filtered = useMemo(() => {
    let result = rows
    if (config.filters && activeFilter !== 'all') {
      const chip = config.filters.find((f) => f.key === activeFilter)
      if (chip?.predicate) result = result.filter(chip.predicate)
    }
    const q = (search.q ?? '').trim().toLowerCase()
    if (q) {
      result = result.filter((row) =>
        config.searchKeys.some((key) => String(row[key] ?? '').toLowerCase().includes(q)),
      )
    }
    return result
  }, [rows, activeFilter, search.q, config])

  const sorted = useMemo(() => {
    if (!search.sort) return filtered
    const col = config.columns.find((c) => c.key === search.sort)
    if (!col?.sortValue) return filtered
    const dir = search.dir === 'desc' ? -1 : 1
    return [...filtered].sort((a, b) => {
      const x = col.sortValue!(a)
      const y = col.sortValue!(b)
      if (x === y) return 0
      return x > y ? dir : -dir
    })
  }, [filtered, search.sort, search.dir, config.columns])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const page = Math.min(localPage, totalPages)
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize)

  const selectedRow = search.recordId ? rows.find((r) => config.getRowId(r) === search.recordId) : undefined
  const drawerContent = selectedRow && config.drawer ? config.drawer(selectedRow) : null

  function onSort(colKey: string) {
    const dir = search.sort === colKey && search.dir === 'asc' ? 'desc' : 'asc'
    setSearch({ sort: colKey, dir })
  }

  function onRowClick(row: TRow) {
    if (config.getRowHref) {
      navigate({ to: config.getRowHref(row) })
      return
    }
    if (!config.drawer) return
    setSearch({ recordId: config.getRowId(row) })
  }

  function closeDrawer() {
    setSearch({ recordId: undefined })
  }

  return (
    <div className="p-6">
      <div className="mb-3.5 flex items-start gap-4">
        <div className="flex-1">
          <div className="text-[18px] font-bold tracking-tight">{config.title}</div>
          {config.subtitle && <div className="mt-0.5 text-[12.5px] text-[var(--text-3)]">{config.subtitle}</div>}
        </div>
        {config.primaryActionLabel && (
          <Button onClick={() => toast(`${config.primaryActionLabel} — form opens here`)}>
            <Plus data-icon="inline-start" />
            {config.primaryActionLabel}
          </Button>
        )}
      </div>

      {config.filters && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {config.filters.map((chip) => {
            const active = activeFilter === chip.key
            return (
              <button
                key={chip.key}
                type="button"
                onClick={() => {
                  setSearch({ filter: chip.key })
                  setLocalPage(1)
                }}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-xs font-medium',
                  active
                    ? 'border-transparent bg-[var(--brand-accent-weak)] text-[var(--brand-accent-d)]'
                    : 'border-border bg-card text-[var(--text-2)] hover:border-[var(--text-3)]',
                )}
              >
                {chip.label}
              </button>
            )
          })}
        </div>
      )}

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-[var(--surface-2)] hover:bg-[var(--surface-2)]">
              {config.columns.map((col) => (
                <TableHead
                  key={col.key}
                  onClick={() => col.sortable && onSort(col.key)}
                  className={cn(
                    'text-[11px] font-semibold uppercase tracking-[0.03em] text-[var(--text-3)]',
                    col.sortable && 'cursor-pointer select-none hover:text-[var(--text-2)]',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                  )}
                >
                  {col.header}
                  {search.sort === col.key && <span className="ml-0.5 text-[var(--brand-accent)]">{search.dir === 'desc' ? ' ↓' : ' ↑'}</span>}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((row) => (
              <TableRow
                key={config.getRowId(row)}
                onClick={() => onRowClick(row)}
                className={cn('border-b-[var(--border-2)]', (config.drawer || config.getRowHref) && 'cursor-pointer')}
              >
                {config.columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={cn(
                      'align-middle',
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center',
                    )}
                  >
                    {col.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {!isLoading && sorted.length === 0 && (
          <div className="p-11 text-center text-[13px] text-[var(--text-3)]">No records match your filters.</div>
        )}

        <div className="flex items-center justify-between border-t border-[var(--border-2)] bg-[var(--surface-2)] px-3.5 py-2 text-[11.5px] text-[var(--text-3)]">
          <div>
            {pageRows.length} of {rows.length} records
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setLocalPage((p) => Math.max(1, p - 1))}
              className="rounded-md border border-border bg-card px-2.5 py-1 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="rounded-md border border-border bg-card px-2.5 py-1 font-semibold text-[var(--brand-accent)]">
              {page}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setLocalPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-md border border-border bg-card px-2.5 py-1 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </Card>

      <RecordDrawer open={!!drawerContent} onOpenChange={(open) => !open && closeDrawer()} content={drawerContent} />
    </div>
  )
}
