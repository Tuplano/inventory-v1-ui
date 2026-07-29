import { useMemo, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface SearchSelectOption {
  value: string
  label: string
  /** Dimmed mono text shown after the label, e.g. a SKU or location code. */
  sublabel?: string
  /** Right-aligned dimmed info, e.g. "125 available · 3 lots". */
  hint?: string
}

/** Searchable dropdown for lists too long to scan in a native select — same popover pattern as
 * the location picker that used to live in AdjustStockModal, generalized. Filtering is local over
 * the options given; when the source itself is server-paged (e.g. the products catalog), pass
 * `loadMore` to append the next page from inside the list. */
export function SearchSelect({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder = 'Search…',
  emptyText = 'No matches.',
  loadMore,
}: {
  value: string
  onChange: (next: string) => void
  options: SearchSelectOption[]
  placeholder: string
  searchPlaceholder?: string
  emptyText?: string
  loadMore?: { hasMore: boolean; isLoading: boolean; onLoad: () => void }
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selected = options.find((o) => o.value === value)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return options
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.sublabel?.toLowerCase().includes(q),
    )
  }, [options, search])

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setSearch('')
      }}
    >
      <PopoverTrigger
        className={cn(
          'flex h-9 w-full items-center justify-between rounded-md border border-[var(--border-2)] bg-transparent px-3 text-[13px]',
          !selected && 'text-[var(--text-3)]',
        )}
      >
        <span className="truncate">
          {selected ? (
            <>
              {selected.label}
              {selected.sublabel && (
                <span className="font-mono text-[10.5px] text-[var(--text-3)]"> ({selected.sublabel})</span>
              )}
            </>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown className="size-3.5 shrink-0 text-[var(--text-3)]" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[320px] p-2">
        <Input
          autoFocus
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2"
        />
        <div className="max-h-[220px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-2 py-3 text-center text-[12px] text-[var(--text-3)]">{emptyText}</div>
          ) : (
            filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value)
                  setOpen(false)
                  setSearch('')
                }}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px] hover:bg-[var(--surface-3)]',
                  o.value === value && 'bg-[var(--brand-accent-weak)]',
                )}
              >
                <span className="min-w-0 truncate">
                  {o.label}
                  {o.sublabel && (
                    <span className="font-mono text-[10.5px] text-[var(--text-3)]"> ({o.sublabel})</span>
                  )}
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  {o.hint && <span className="text-[10.5px] text-[var(--text-3)]">{o.hint}</span>}
                  {o.value === value && <Check className="size-3.5 shrink-0 text-[var(--brand-accent)]" />}
                </span>
              </button>
            ))
          )}
          {loadMore?.hasMore && (
            <button
              type="button"
              disabled={loadMore.isLoading}
              onClick={loadMore.onLoad}
              className="w-full border-t border-[var(--border-2)] py-1.5 text-center text-[11px] font-semibold text-[var(--brand-accent)] hover:bg-[var(--surface-2)] disabled:opacity-50"
            >
              {loadMore.isLoading ? 'Loading…' : 'Load more'}
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
