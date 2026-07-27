import { useEffect, useState } from 'react'
import { useLocationSerials, type SerialScope } from '@/hooks/queries/use-location-serials'
import { useDebouncedValue } from '@/hooks/use-debounced-value'

/** Checkbox picker for choosing specific serial numbers out of a product's stock within one scope
 * (a bin, or the unplaced pool) — used by Adjust/Transfer/Place. A scope can hold thousands of
 * units, so this never loads "all of them" into the DOM: it fetches a page at a time, with search
 * to jump straight to a known serial. The selection itself (`selected`) is owned by the caller and
 * persists across searches/pages — checking a serial, then searching for another, keeps the first
 * one selected even though it's scrolled out of view. */
export function SerialPickerField({
  productId,
  scope,
  totalCount,
  selected,
  onChange,
}: {
  productId: string
  scope: SerialScope
  totalCount: number
  selected: string[]
  onChange: (next: string[]) => void
}) {
  const [search, setSearch] = useState('')
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [items, setItems] = useState<{ id: string; serialNumber: string }[]>([])
  const debouncedSearch = useDebouncedValue(search)

  const { data, isFetching } = useLocationSerials(productId, scope, debouncedSearch, cursor, true)

  // Start over whenever the product/scope changes or the search term changes — otherwise keep
  // appending pages, since cursor pagination never re-orders earlier ones.
  useEffect(() => {
    setItems([])
    setCursor(undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, 'locationId' in scope ? scope.locationId : 'unplaced', debouncedSearch])

  useEffect(() => {
    if (!data) return
    setItems((prev) => {
      const seen = new Set(prev.map((p) => p.id))
      return [...prev, ...data.items.filter((item) => !seen.has(item.id))]
    })
  }, [data])

  function toggle(sn: string) {
    onChange(selected.includes(sn) ? selected.filter((s) => s !== sn) : [...selected, sn])
  }

  const allLoadedSelected = items.length > 0 && items.every((item) => selected.includes(item.serialNumber))

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-[11.5px] font-semibold text-[var(--text-2)]">Serial numbers</label>
        <button
          type="button"
          onClick={() => {
            if (allLoadedSelected) {
              const loaded = new Set(items.map((i) => i.serialNumber))
              onChange(selected.filter((s) => !loaded.has(s)))
            } else {
              onChange([...new Set([...selected, ...items.map((i) => i.serialNumber)])])
            }
          }}
          className="text-[10px] font-semibold text-[var(--brand-accent)]"
        >
          {allLoadedSelected ? 'Clear shown' : 'Select shown'}
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={`Search ${totalCount.toLocaleString()} serial(s)...`}
        className="mb-1.5 h-8 w-full rounded-md border border-[var(--border-2)] bg-transparent px-2.5 text-[12px] outline-none focus:border-[var(--brand-accent)]"
      />

      <div className="max-h-[180px] overflow-auto rounded-lg border border-[var(--border-2)]">
        {items.length === 0 && !isFetching && (
          <div className="px-2.5 py-3 text-center text-[12px] text-[var(--text-3)]">
            {search ? 'No matching serial numbers' : 'No serial numbers'}
          </div>
        )}
        {items.map((sn) => (
          <label
            key={sn.id}
            className="flex cursor-pointer items-center gap-2 border-b border-[var(--border-2)] px-2.5 py-1.5 text-[12px] font-mono last:border-b-0 hover:bg-[var(--surface-2)]"
          >
            <input type="checkbox" checked={selected.includes(sn.serialNumber)} onChange={() => toggle(sn.serialNumber)} />
            {sn.serialNumber}
          </label>
        ))}
        {data?.nextCursor && (
          <button
            type="button"
            disabled={isFetching}
            onClick={() => setCursor(data.nextCursor ?? undefined)}
            className="w-full border-t border-[var(--border-2)] py-1.5 text-center text-[11px] font-semibold text-[var(--brand-accent)] hover:bg-[var(--surface-2)] disabled:opacity-50"
          >
            {isFetching ? 'Loading…' : 'Load more'}
          </button>
        )}
      </div>
      <div className="mt-1 text-[10.5px] text-[var(--text-3)]">
        {selected.length} of {totalCount.toLocaleString()} selected
      </div>
    </div>
  )
}
