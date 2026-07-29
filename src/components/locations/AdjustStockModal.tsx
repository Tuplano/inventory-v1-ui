import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { PlusCircle, MinusCircle, ClipboardCheck } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { SearchSelect } from '@/components/ui/search-select'
import { useProducts } from '@/hooks/queries/use-products'
import { useBatches } from '@/hooks/queries/use-batches'
import { useLocations } from '@/hooks/queries/use-locations'
import { useLocation, type LocationContentLine } from '@/hooks/queries/use-location'
import { ADJUST_STOCK_REASON_LABELS, useAdjustStock, type AdjustStockReason } from '@/hooks/mutations/use-adjust-stock'
import { SerialPickerField } from '@/components/locations/SerialPickerField'

type Direction = 'DECREASE' | 'INCREASE'

const DECREASE_REASONS: AdjustStockReason[] = ['COUNT_CORRECTION', 'DEFECTIVE', 'ISSUE']

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
  const { data: products = [], fetchNextPage, hasNextPage, isFetchingNextPage } = useProducts()
  const { data: batches = [] } = useBatches()
  const { data: locations = [] } = useLocations()
  const adjustStock = useAdjustStock()

  const [locationId, setLocationId] = useState('')
  const { data: locationDetail } = useLocation(locationId)
  const contents = locationDetail?.contents ?? EMPTY_CONTENTS
  const locationName = locationDetail?.name ?? locations.find((l) => l.id === locationId)?.name ?? ''

  const trackingByProduct = useMemo(() => new Map(products.map((p) => [p.id, p.trackingType])), [products])

  // What's already at this bin, grouped by product + batch + receiving line. Keeping each
  // receiving line separate (rather than summing every lot of a product/batch together) means a
  // correction targets the exact receipt the user is looking at instead of the backend silently
  // FIFO-consuming oldest-first across receipts the user never chose — see the receivingLineId
  // passed through to useAdjustStock below. Serial-tracked lines have no lot of their own
  // (receivingLineId is null for those, per LocationContentLine) and stay grouped by product+batch
  // since serial selection pins the exact units anyway.
  const decreaseGroups = useMemo(() => {
    const groups: Record<
      string,
      {
        productId: string
        batchId: string | null
        receivingLineId: string | null
        receivingNumber: string | null
        name: string
        sku: string
        qty: number
        isSerialTracked: boolean
      }
    > = {}
    for (const c of contents) {
      const key = `${c.productId}::${c.batchId ?? 'none'}::${c.receivingLineId ?? 'none'}`
      const entry =
        groups[key] ??
        {
          productId: c.productId,
          batchId: c.batchId,
          receivingLineId: c.receivingLineId,
          receivingNumber: c.receivingNumber,
          name: c.productName,
          sku: c.productSku,
          qty: 0,
          isSerialTracked: false,
        }
      entry.qty += c.quantity
      if (c.isSerialTracked) entry.isSerialTracked = true
      groups[key] = entry
    }
    return Object.entries(groups).map(([key, v]) => ({ key, ...v }))
  }, [contents])

  // INCREASE is a count correction ("found more than recorded"), not a way to introduce a
  // product to a bin it's never held — so it only offers products with an existing footprint
  // at this location, same universe the decrease side already scopes to via `contents`.
  const productsAtLocation = useMemo(() => {
    const idsHere = new Set(contents.map((c) => c.productId))
    return products.filter((p) => idsHere.has(p.id))
  }, [products, contents])

  const [direction, setDirection] = useState<Direction>('DECREASE')
  const [reason, setReason] = useState<AdjustStockReason>('COUNT_CORRECTION')
  const [groupKey, setGroupKey] = useState('')
  const [increaseProductId, setIncreaseProductId] = useState('')
  const [increaseBatchId, setIncreaseBatchId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [selectedSerials, setSelectedSerials] = useState<string[]>([])
  const [newSerialsRaw, setNewSerialsRaw] = useState('')
  const [foundQuantity, setFoundQuantity] = useState('')
  const [remarks, setRemarks] = useState('')

  useEffect(() => {
    if (!open) return
    setLocationId(defaultLocationId ?? '')
    setDirection('DECREASE')
    setReason('COUNT_CORRECTION')
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
    // A product selected for increase at the previous location may not have a footprint at the
    // new one — clear it rather than leave a stale id that no longer matches a rendered option.
    setIncreaseProductId('')
    setIncreaseBatchId('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId, contents])

  function switchDirection(next: Direction) {
    setDirection(next)
    setReason('COUNT_CORRECTION')
    setQuantity('')
    setSelectedSerials([])
    setNewSerialsRaw('')
    setFoundQuantity('')
  }

  const selectedGroup = decreaseGroups.find((g) => g.key === groupKey)
  const decreaseTracking = selectedGroup ? trackingByProduct.get(selectedGroup.productId) : undefined
  const isDecreaseSerial = decreaseTracking === 'SERIAL' && !!selectedGroup?.isSerialTracked

  const increaseTracking = increaseProductId ? trackingByProduct.get(increaseProductId) : undefined
  const increaseBatchOptions = batches.filter((b) => b.productId === increaseProductId && b.isActive)

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
            reason,
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
          reason,
          batchId: selectedGroup.batchId ?? undefined,
          receivingLineId: selectedGroup.receivingLineId ?? undefined,
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
          <div className="rounded-md bg-[var(--surface-2)] px-3 py-2 text-[11px] leading-[1.4] text-[var(--text-3)]">
            For stock issues with <strong className="text-[var(--text-2)]">no purchase order involved</strong> — a physical count came up
            short/over, staff pulled stock for use, or damaged stock that's being scrapped in-house. Might this go{' '}
            <strong className="text-[var(--text-2)]">back to the supplier</strong> (refund, replacement, credit)? Use{' '}
            <strong className="text-[var(--text-2)]">Supplier returns</strong> instead — once you adjust it out here as Defective,
            it can no longer be selected for a supplier return.
          </div>

          <div>
            <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">Location</Label>
            <SearchSelect
              value={locationId}
              onChange={setLocationId}
              placeholder="Select a location"
              searchPlaceholder="Search locations…"
              emptyText="No locations found."
              options={locations.map((l) => ({ value: l.id, label: l.name, sublabel: l.code }))}
            />
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
                  <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">Reason</Label>
                  <NativeSelect className="w-full" value={reason} onChange={(e) => setReason(e.target.value as AdjustStockReason)}>
                    {DECREASE_REASONS.map((r) => (
                      <NativeSelectOption key={r} value={r}>
                        {ADJUST_STOCK_REASON_LABELS[r]}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  {reason === 'DEFECTIVE' && (
                    <div className="mt-1.5 text-[10.5px] leading-[1.4] text-[var(--amber)]">
                      Going to the supplier for a refund/replacement? Cancel this and use Supplier returns instead — once
                      adjusted out here, this stock can't be selected for a return anymore.
                    </div>
                  )}
                </div>
              ) : null}

              {direction === 'DECREASE' ? (
                <div>
                  <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">Product / receiving / batch</Label>
                  {decreaseGroups.length === 0 ? (
                    <div className="text-xs text-[var(--text-3)]">Nothing at this location to adjust.</div>
                  ) : (
                    <SearchSelect
                      value={groupKey}
                      onChange={(next) => {
                        setGroupKey(next)
                        setQuantity('')
                        setSelectedSerials([])
                      }}
                      placeholder="Select what to adjust"
                      searchPlaceholder="Search products…"
                      options={decreaseGroups.map((g) => ({
                        value: g.key,
                        label: g.name,
                        sublabel: g.sku,
                        hint: `${g.receivingNumber ? `via ${g.receivingNumber} · ` : ''}${g.batchId ? 'batch · ' : ''}${g.qty.toLocaleString()} available`,
                      }))}
                    />
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">Product</Label>
                    {productsAtLocation.length === 0 ? (
                      <div className="text-xs text-[var(--text-3)]">
                        Nothing has ever been placed here — use Place received stock or a transfer first.
                      </div>
                    ) : (
                      <SearchSelect
                        value={increaseProductId}
                        onChange={(next) => {
                          setIncreaseProductId(next)
                          setIncreaseBatchId('')
                          setQuantity('')
                          setNewSerialsRaw('')
                          setFoundQuantity('')
                        }}
                        placeholder="Select a product"
                        searchPlaceholder="Search products…"
                        options={productsAtLocation.map((p) => ({ value: p.id, label: p.name, sublabel: p.sku }))}
                        loadMore={{ hasMore: !!hasNextPage, isLoading: isFetchingNextPage, onLoad: () => fetchNextPage() }}
                      />
                    )}
                  </div>

                  {increaseTracking === 'BATCH' && (
                    <div>
                      <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">Batch</Label>
                      <SearchSelect
                        value={increaseBatchId}
                        onChange={setIncreaseBatchId}
                        placeholder="Select a batch"
                        searchPlaceholder="Search batches…"
                        options={increaseBatchOptions.map((b) => ({
                          value: b.id,
                          label: b.batchNumber,
                          sublabel: b.lotNumber ?? undefined,
                        }))}
                      />
                      {increaseProductId && increaseBatchOptions.length === 0 && (
                        <div className="mt-1 text-[10.5px] text-[var(--text-3)]">No active batches for this product yet.</div>
                      )}
                    </div>
                  )}
                </>
              )}

              {(direction === 'DECREASE' ? isDecreaseSerial : increaseTracking === 'SERIAL') ? (
                direction === 'DECREASE' ? (
                  selectedGroup && (
                    <SerialPickerField
                      productId={selectedGroup.productId}
                      scope={{ locationId }}
                      totalCount={selectedGroup.qty}
                      selected={selectedSerials}
                      onChange={setSelectedSerials}
                    />
                  )
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
