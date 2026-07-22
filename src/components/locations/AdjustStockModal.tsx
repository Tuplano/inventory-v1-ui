import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { PlusCircle, MinusCircle, ClipboardCheck, ChevronDown, Check } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useProducts } from '@/hooks/queries/use-products'
import { useBatches } from '@/hooks/queries/use-batches'
import { useLocations } from '@/hooks/queries/use-locations'
import { useLocation, type LocationContentLine } from '@/hooks/queries/use-location'
import { useAdjustStock } from '@/hooks/mutations/use-adjust-stock'
import { cn } from '@/lib/utils'

type Direction = 'DECREASE' | 'INCREASE'

// Stable reference so `contents` doesn't become a new array (and re-trigger effects keyed on it)
// on every render while locationDetail is still loading/undefined.
const EMPTY_CONTENTS: LocationContentLine[] = []

/** Splits a serials textarea's raw text into trimmed, non-blank entries (one per line or comma). */
function parseSerials(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function AdjustStockModal({
  open,
  onOpenChange,
  defaultLocationId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Pre-fills the location picker when opened from a location's own detail page. Still changeable. */
  defaultLocationId?: string
}) {
  const { data: products = [] } = useProducts()
  const { data: batches = [] } = useBatches()
  const { data: locations = [] } = useLocations()
  const adjustStock = useAdjustStock()

  const [locationId, setLocationId] = useState('')
  const { data: locationDetail } = useLocation(locationId)
  const contents = locationDetail?.contents ?? EMPTY_CONTENTS
  const locationName = locationDetail?.name ?? locations.find((l) => l.id === locationId)?.name ?? ''

  const trackingByProduct = useMemo(() => new Map(products.map((p) => [p.id, p.trackingType])), [products])

  // What's already at this bin, grouped by product + batch (batch precision matters for a count
  // correction, unlike a transfer which just moves total quantity FIFO regardless of batch).
  const decreaseGroups = useMemo(() => {
    const groups: Record<
      string,
      { productId: string; batchId: string | null; name: string; sku: string; qty: number; serialNumbers: string[] | null }
    > = {}
    for (const c of contents) {
      const key = `${c.productId}::${c.batchId ?? 'none'}`
      const entry = groups[key] ?? { productId: c.productId, batchId: c.batchId, name: c.productName, sku: c.productSku, qty: 0, serialNumbers: null }
      entry.qty += c.quantity
      if (c.serialNumbers) entry.serialNumbers = [...(entry.serialNumbers ?? []), ...c.serialNumbers]
      groups[key] = entry
    }
    return Object.entries(groups).map(([key, v]) => ({ key, ...v }))
  }, [contents])

  const [locationPickerOpen, setLocationPickerOpen] = useState(false)
  const [locationSearch, setLocationSearch] = useState('')
  const [direction, setDirection] = useState<Direction>('DECREASE')
  const [groupKey, setGroupKey] = useState('')
  const [increaseProductId, setIncreaseProductId] = useState('')
  const [increaseBatchId, setIncreaseBatchId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [selectedSerials, setSelectedSerials] = useState<string[]>([])
  const [newSerialsRaw, setNewSerialsRaw] = useState('')
  const [foundQuantity, setFoundQuantity] = useState('')
  const [remarks, setRemarks] = useState('')

  const filteredLocations = useMemo(() => {
    const q = locationSearch.trim().toLowerCase()
    if (!q) return locations
    return locations.filter((l) => l.name.toLowerCase().includes(q) || l.code.toLowerCase().includes(q))
  }, [locations, locationSearch])

  useEffect(() => {
    if (!open) return
    setLocationId(defaultLocationId ?? '')
    setLocationSearch('')
    setDirection('DECREASE')
    setIncreaseProductId('')
    setIncreaseBatchId('')
    setQuantity('')
    setSelectedSerials([])
    setNewSerialsRaw('')
    setFoundQuantity('')
    setRemarks('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultLocationId])

  // Re-pick a default group whenever the location (and so its contents) changes — a group key
  // from the previous location won't exist here. Keyed on `contents` too since it loads async
  // after `locationId` changes.
  useEffect(() => {
    setGroupKey(decreaseGroups[0]?.key ?? '')
    setQuantity('')
    setSelectedSerials([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId, contents])

  function switchDirection(next: Direction) {
    setDirection(next)
    setQuantity('')
    setSelectedSerials([])
    setNewSerialsRaw('')
    setFoundQuantity('')
  }

  const selectedGroup = decreaseGroups.find((g) => g.key === groupKey)
  const decreaseTracking = selectedGroup ? trackingByProduct.get(selectedGroup.productId) : undefined
  const isDecreaseSerial = decreaseTracking === 'SERIAL' && !!selectedGroup?.serialNumbers

  const increaseTracking = increaseProductId ? trackingByProduct.get(increaseProductId) : undefined
  const increaseBatchOptions = batches.filter((b) => b.productId === increaseProductId && b.isActive)

  function toggleSerial(sn: string) {
    setSelectedSerials((prev) => (prev.includes(sn) ? prev.filter((s) => s !== sn) : [...prev, sn]))
  }

  function handleSubmit() {
    if (!locationId) {
      toast.warning('Select a location')
      return
    }

    const trimmedRemarks = remarks.trim()
    if (!trimmedRemarks) {
      toast.warning('Enter a reason for this adjustment')
      return
    }

    if (direction === 'DECREASE') {
      if (!selectedGroup) {
        toast.warning('Select what to adjust')
        return
      }

      if (isDecreaseSerial) {
        if (selectedSerials.length === 0) {
          toast.warning('Select at least one serial number')
          return
        }
        adjustStock.mutate(
          {
            productId: selectedGroup.productId,
            locationId,
            direction,
            serialNumbers: selectedSerials,
            remarks: trimmedRemarks,
          },
          { onSuccess: () => onOpenChange(false) },
        )
        return
      }

      const qty = Number(quantity)
      if (!qty || qty <= 0) {
        toast.warning('Enter a quantity greater than zero')
        return
      }
      if (qty > selectedGroup.qty) {
        toast.warning(`Only ${selectedGroup.qty.toLocaleString()} available at ${locationName}`)
        return
      }

      adjustStock.mutate(
        {
          productId: selectedGroup.productId,
          locationId,
          direction,
          batchId: selectedGroup.batchId ?? undefined,
          quantity: qty,
          remarks: trimmedRemarks,
        },
        { onSuccess: () => onOpenChange(false) },
      )
      return
    }

    // INCREASE
    if (!increaseProductId) {
      toast.warning('Select a product')
      return
    }
    if (increaseTracking === 'BATCH' && !increaseBatchId) {
      toast.warning('Select a batch')
      return
    }

    if (increaseTracking === 'SERIAL') {
      const foundQty = Number(foundQuantity)
      if (!foundQty || foundQty <= 0) {
        toast.warning('Enter how many units were found')
        return
      }

      const serials = parseSerials(newSerialsRaw)
      if (serials.length === 0) {
        toast.warning('Enter at least one serial number')
        return
      }
      if (new Set(serials).size !== serials.length) {
        toast.warning('Duplicate serial numbers entered')
        return
      }
      if (serials.length !== foundQty) {
        toast.warning(`Entered ${serials.length} serial(s), but quantity found is ${foundQty} — they must match`)
        return
      }

      adjustStock.mutate(
        { productId: increaseProductId, locationId, direction, serialNumbers: serials, remarks: trimmedRemarks },
        { onSuccess: () => onOpenChange(false) },
      )
      return
    }

    const qty = Number(quantity)
    if (!qty || qty <= 0) {
      toast.warning('Enter a quantity greater than zero')
      return
    }

    adjustStock.mutate(
      {
        productId: increaseProductId,
        locationId,
        direction,
        batchId: increaseTracking === 'BATCH' ? increaseBatchId : undefined,
        quantity: qty,
        remarks: trimmedRemarks,
      },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Adjust stock</DialogTitle>
          <div className="text-xs text-[var(--text-3)]">{locationName || 'Correct a product/batch/serial quantity at a bin'}</div>
        </DialogHeader>

        <div className="flex flex-col gap-3.5 py-2">
          <div>
            <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">Location</Label>
            <Popover
              open={locationPickerOpen}
              onOpenChange={(next) => {
                setLocationPickerOpen(next)
                if (!next) setLocationSearch('')
              }}
            >
              <PopoverTrigger
                className={cn(
                  'flex h-9 w-full items-center justify-between rounded-md border border-[var(--border-2)] bg-transparent px-3 text-[13px]',
                  !locationName && 'text-[var(--text-3)]',
                )}
              >
                <span className="truncate">{locationName || 'Select a location'}</span>
                <ChevronDown className="size-3.5 shrink-0 text-[var(--text-3)]" />
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[320px] p-2">
                <Input
                  autoFocus
                  placeholder="Search locations…"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="mb-2"
                />
                <div className="max-h-[220px] overflow-y-auto">
                  {filteredLocations.length === 0 ? (
                    <div className="px-2 py-3 text-center text-[12px] text-[var(--text-3)]">No locations found.</div>
                  ) : (
                    filteredLocations.map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => {
                          setLocationId(l.id)
                          setLocationPickerOpen(false)
                          setLocationSearch('')
                        }}
                        className={cn(
                          'flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[12.5px] hover:bg-[var(--surface-3)]',
                          l.id === locationId && 'bg-[var(--brand-accent-weak)]',
                        )}
                      >
                        <span>
                          {l.name} <span className="font-mono text-[10.5px] text-[var(--text-3)]">({l.code})</span>
                        </span>
                        {l.id === locationId && <Check className="size-3.5 shrink-0 text-[var(--brand-accent)]" />}
                      </button>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant={direction === 'DECREASE' ? 'default' : 'outline'}
              className="flex-1"
              disabled={!locationId}
              onClick={() => switchDirection('DECREASE')}
            >
              <MinusCircle data-icon="inline-start" />
              Decrease
            </Button>
            <Button
              type="button"
              variant={direction === 'INCREASE' ? 'default' : 'outline'}
              className="flex-1"
              disabled={!locationId}
              onClick={() => switchDirection('INCREASE')}
            >
              <PlusCircle data-icon="inline-start" />
              Increase
            </Button>
          </div>

          {locationId && (
            <>
              {direction === 'DECREASE' ? (
                <div>
                  <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">Product / batch</Label>
                  {decreaseGroups.length === 0 ? (
                    <div className="text-xs text-[var(--text-3)]">Nothing at this location to adjust.</div>
                  ) : (
                    <NativeSelect
                      className="w-full"
                      value={groupKey}
                      onChange={(e) => {
                        setGroupKey(e.target.value)
                        setQuantity('')
                        setSelectedSerials([])
                      }}
                    >
                      {decreaseGroups.map((g) => (
                        <NativeSelectOption key={g.key} value={g.key}>
                          {g.name} ({g.sku}){g.batchId ? ` · batch` : ''} · {g.qty.toLocaleString()} available
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">Product</Label>
                    <NativeSelect
                      className="w-full"
                      value={increaseProductId}
                      onChange={(e) => {
                        setIncreaseProductId(e.target.value)
                        setIncreaseBatchId('')
                        setQuantity('')
                        setNewSerialsRaw('')
                        setFoundQuantity('')
                      }}
                    >
                      <NativeSelectOption value="">Select a product</NativeSelectOption>
                      {products.map((p) => (
                        <NativeSelectOption key={p.id} value={p.id}>
                          {p.sku} — {p.name}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </div>

                  {increaseTracking === 'BATCH' && (
                    <div>
                      <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">Batch</Label>
                      <NativeSelect className="w-full" value={increaseBatchId} onChange={(e) => setIncreaseBatchId(e.target.value)}>
                        <NativeSelectOption value="">Select a batch</NativeSelectOption>
                        {increaseBatchOptions.map((b) => (
                          <NativeSelectOption key={b.id} value={b.id}>
                            {b.batchNumber}
                            {b.lotNumber ? ` · ${b.lotNumber}` : ''}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                      {increaseProductId && increaseBatchOptions.length === 0 && (
                        <div className="mt-1 text-[10.5px] text-[var(--text-3)]">No active batches for this product yet.</div>
                      )}
                    </div>
                  )}
                </>
              )}

              {(direction === 'DECREASE' ? isDecreaseSerial : increaseTracking === 'SERIAL') ? (
                direction === 'DECREASE' ? (
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <Label className="text-[11.5px] font-semibold text-[var(--text-2)]">Serial numbers</Label>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedSerials(
                            selectedSerials.length === (selectedGroup?.serialNumbers?.length ?? 0)
                              ? []
                              : [...(selectedGroup?.serialNumbers ?? [])],
                          )
                        }
                        className="text-[10px] font-semibold text-[var(--brand-accent)]"
                      >
                        {selectedSerials.length === (selectedGroup?.serialNumbers?.length ?? 0) ? 'Clear all' : 'Select all'}
                      </button>
                    </div>
                    <div className="max-h-[180px] overflow-auto rounded-lg border border-[var(--border-2)]">
                      {(selectedGroup?.serialNumbers ?? []).map((sn) => (
                        <label
                          key={sn}
                          className="flex cursor-pointer items-center gap-2 border-b border-[var(--border-2)] px-2.5 py-1.5 text-[12px] font-mono last:border-b-0 hover:bg-[var(--surface-2)]"
                        >
                          <input type="checkbox" checked={selectedSerials.includes(sn)} onChange={() => toggleSerial(sn)} />
                          {sn}
                        </label>
                      ))}
                    </div>
                    <div className="mt-1 text-[10.5px] text-[var(--text-3)]">
                      {selectedSerials.length} of {selectedGroup?.serialNumbers?.length ?? 0} selected
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="adj-found-qty" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                        Quantity found
                      </Label>
                      <Input
                        id="adj-found-qty"
                        value={foundQuantity}
                        onChange={(e) => setFoundQuantity(e.target.value.replace(/[^0-9]/g, ''))}
                        inputMode="numeric"
                        className="w-[120px] font-mono"
                      />
                    </div>
                    <div>
                      <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">New serial numbers</Label>
                      <Textarea
                        value={newSerialsRaw}
                        onChange={(e) => setNewSerialsRaw(e.target.value)}
                        placeholder="One serial per line"
                        rows={5}
                        className="w-full resize-none font-mono text-[12px]"
                      />
                      {(() => {
                        const serials = parseSerials(newSerialsRaw)
                        const foundQty = Number(foundQuantity) || 0
                        const hasDuplicates = new Set(serials).size !== serials.length
                        const matches = foundQty > 0 && serials.length === foundQty && !hasDuplicates
                        return (
                          <div
                            className="mt-1 text-[10.5px] font-semibold"
                            style={{ color: serials.length === 0 ? 'var(--text-3)' : matches ? 'var(--green)' : 'var(--red)' }}
                          >
                            {serials.length} of {foundQty || '?'} serial(s) entered
                            {hasDuplicates ? ' · duplicates found' : ''}
                          </div>
                        )
                      })()}
                    </div>
                  </>
                )
              ) : (
                <div>
                  <Label htmlFor="adj-qty" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                    Quantity
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="adj-qty"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value.replace(/[^0-9.]/g, ''))}
                      inputMode="decimal"
                      className="w-[120px] font-mono"
                    />
                    {direction === 'DECREASE' && selectedGroup && (
                      <button
                        type="button"
                        onClick={() => setQuantity(String(selectedGroup.qty))}
                        className="text-[10px] font-semibold text-[var(--brand-accent)]"
                      >
                        MAX ({selectedGroup.qty.toLocaleString()})
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          <div>
            <Label htmlFor="adj-remarks" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
              Reason
            </Label>
            <Textarea
              id="adj-remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Physical count correction"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={adjustStock.isPending}>
            <ClipboardCheck data-icon="inline-start" />
            Adjust
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
