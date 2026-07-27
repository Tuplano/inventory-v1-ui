import { useEffect, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { MonoCell } from '@/components/entity-table/cells'
import { useLocationSerials, type SerialScope } from '@/hooks/queries/use-location-serials'
import { useDebouncedValue } from '@/hooks/use-debounced-value'

/** Shows the serial numbers for one product within one scope (a bin, or the unplaced pool). A
 * scope can hold thousands of units of the same product, so this never asks for "all of them" —
 * it fetches a page at a time from /serial-numbers (already paginated server-side) only once the
 * popover is opened, with search to jump straight to a known serial instead of paging through. */
export function SerialListPopover({ productId, scope, count }: { productId: string; scope: SerialScope; count: number }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [items, setItems] = useState<{ id: string; serialNumber: string }[]>([])
  const debouncedSearch = useDebouncedValue(search)

  const { data, isFetching } = useLocationSerials(productId, scope, debouncedSearch, cursor, open)

  // Start over whenever the popover (re)opens or the search term changes — otherwise keep
  // appending pages, since cursor pagination never re-orders earlier ones.
  useEffect(() => {
    setItems([])
    setCursor(undefined)
  }, [open, debouncedSearch])

  useEffect(() => {
    if (!data) return
    setItems((prev) => {
      const seen = new Set(prev.map((p) => p.id))
      return [...prev, ...data.items.filter((item) => !seen.has(item.id))]
    })
  }, [data])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="font-mono text-[12px] text-[var(--brand-accent)] hover:underline">
        {count.toLocaleString()} serial(s)
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-0">
        <div className="border-b border-[var(--border-2)] p-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${count.toLocaleString()} serial(s)...`}
            className="h-8 w-full rounded-md border border-[var(--border-2)] bg-transparent px-2.5 text-[12px] outline-none focus:border-[var(--brand-accent)]"
          />
        </div>
        <div className="max-h-64 overflow-y-auto p-2.5">
          {items.length === 0 && !isFetching && (
            <div className="p-2 text-center text-[12px] text-[var(--text-3)]">
              {search ? 'No matching serial numbers' : 'No serial numbers'}
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            {items.map((sn) => (
              <MonoCell key={sn.id} value={sn.serialNumber} />
            ))}
          </div>
          {data?.nextCursor && (
            <button
              type="button"
              disabled={isFetching}
              onClick={() => setCursor(data.nextCursor ?? undefined)}
              className="mt-2 w-full rounded-md py-1.5 text-center text-[11px] font-semibold text-[var(--brand-accent)] hover:bg-[var(--surface-2)] disabled:opacity-50"
            >
              {isFetching ? 'Loading…' : 'Load more'}
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
