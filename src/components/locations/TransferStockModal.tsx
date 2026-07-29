import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ArrowRightLeft } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SearchSelect } from '@/components/ui/search-select'
import { useLocations } from '@/hooks/queries/use-locations'
import { useTransferStock } from '@/hooks/mutations/use-transfer-stock'
import { SerialPickerField } from '@/components/locations/SerialPickerField'
import type { LocationContentLine } from '@/hooks/queries/use-location'

export function TransferStockModal({
  open,
  onOpenChange,
  fromLocationId,
  fromLocationName,
  contents,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  fromLocationId: string
  fromLocationName: string
  contents: LocationContentLine[]
}) {
  const { data: locations = [] } = useLocations()
  const transferStock = useTransferStock()

  // Serial-tracked units and lot rows of the same product are transferable separately — a SERIAL
  // product can hold unserialized quantity (received without serials) that moves like a lot, so
  // both totals are kept rather than one combined sum.
  const productSummaries = useMemo(() => {
    const byId: Record<string, { name: string; sku: string; lotQty: number; serialQty: number; lotCount: number }> = {}
    for (const c of contents) {
      const entry = byId[c.productId] ?? { name: c.productName, sku: c.productSku, lotQty: 0, serialQty: 0, lotCount: 0 }
      if (c.isSerialTracked) {
        entry.serialQty += c.quantity
      } else {
        entry.lotQty += c.quantity
        entry.lotCount += 1
      }
      byId[c.productId] = entry
    }
    return byId
  }, [contents])
  const productOptions = Object.entries(productSummaries).map(([productId, v]) => ({ productId, ...v }))

  const [productId, setProductId] = useState('')
  const [toLocationId, setToLocationId] = useState('')
  const [stockMode, setStockMode] = useState<'SERIAL' | 'LOT'>('SERIAL')
  const [quantity, setQuantity] = useState('')
  const [lotQuantities, setLotQuantities] = useState<Record<string, string>>({})
  const [selectedSerials, setSelectedSerials] = useState<string[]>([])
  const [remarks, setRemarks] = useState('')

  useEffect(() => {
    if (!open) return
    setProductId(contents[0]?.productId ?? '')
    setToLocationId('')
    setStockMode('SERIAL')
    setQuantity('')
    setLotQuantities({})
    setSelectedSerials([])
    setRemarks('')
    // Reset only when the dialog opens — a background contents refetch while the user is mid-entry
    // must not wipe the form. The effect below handles contents arriving/changing while open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Contents load async and can refetch while open; keep the selected product valid without
  // resetting anything the user already entered.
  useEffect(() => {
    if (!open) return
    if (!contents.some((c) => c.productId === productId)) {
      setProductId(contents[0]?.productId ?? '')
      setQuantity('')
      setLotQuantities({})
      setSelectedSerials([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, contents])

  const destinations = locations.filter((l) => l.id !== fromLocationId && l.isActive)
  const summary = productSummaries[productId]

  const productLots = contents.filter(
    (c) => c.productId === productId && !c.isSerialTracked && c.receivingLineLocationId != null,
  )
  const lotAvailable = summary?.lotQty ?? 0
  const serialAvailable = summary?.serialQty ?? 0

  // A serial-summary line only ever exists for serial-tracked units, so the contents alone tell
  // us whether this product has a serialized portion here — no product lookup needed.
  const hasSerialStock = serialAvailable > 0
  const hasLotStock = productLots.length > 0
  // A SERIAL product can hold both serialized units and unserialized lot quantity at the same
  // bin — those move via different payloads, so the user picks which portion to transfer.
  const hasBoth = hasSerialStock && hasLotStock
  const isSerial = hasSerialStock && (!hasBoth || stockMode === 'SERIAL')
  // With a single lot, FIFO hits that lot anyway — a plain quantity field records the same thing.
  const isLotMode = !isSerial && hasLotStock && productLots.length > 1

  function lotLabel(lot: LocationContentLine) {
    return lot.batchNumber ?? lot.receivingNumber ?? 'Unlabeled lot'
  }

  const pickedTotal = productLots.reduce((sum, lot) => {
    const qty = Number(lotQuantities[lot.receivingLineLocationId!] ?? '')
    return sum + (Number.isFinite(qty) && qty > 0 ? qty : 0)
  }, 0)

  function handleProductChange(nextProductId: string) {
    setProductId(nextProductId)
    setStockMode('SERIAL')
    setSelectedSerials([])
    setQuantity('')
    setLotQuantities({})
  }

  function handleSubmit() {
    if (!productId) {
      toast.warning('Select a product to transfer')
      return
    }
    if (!toLocationId) {
      toast.warning('Select a destination location')
      return
    }

    if (isSerial) {
      if (selectedSerials.length === 0) {
        toast.warning('Select at least one serial number to transfer')
        return
      }
      transferStock.mutate(
        { productId, fromLocationId, toLocationId, serialNumbers: selectedSerials, remarks: remarks.trim() || undefined },
        { onSuccess: () => onOpenChange(false) },
      )
      return
    }

    if (isLotMode) {
      const entries = productLots
        .map((lot) => ({ lot, raw: (lotQuantities[lot.receivingLineLocationId!] ?? '').trim() }))
        .filter((entry) => entry.raw !== '')
      const invalid = entries.find((entry) => !(Number(entry.raw) > 0))
      if (invalid) {
        toast.warning(`Invalid quantity "${invalid.raw}" for ${lotLabel(invalid.lot)}`)
        return
      }
      const picked = entries.map((entry) => ({ lot: entry.lot, qty: Number(entry.raw) }))
      if (picked.length === 0) {
        toast.warning('Enter a quantity for at least one lot')
        return
      }
      const over = picked.find((entry) => entry.qty > entry.lot.quantity)
      if (over) {
        toast.warning(`Only ${over.lot.quantity.toLocaleString()} available in ${lotLabel(over.lot)}`)
        return
      }
      transferStock.mutate(
        {
          productId,
          fromLocationId,
          toLocationId,
          lines: picked.map((entry) => ({
            receivingLineLocationId: entry.lot.receivingLineLocationId!,
            quantity: entry.qty,
          })),
          remarks: remarks.trim() || undefined,
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
    if (qty > lotAvailable) {
      toast.warning(`Only ${lotAvailable.toLocaleString()} available at ${fromLocationName}`)
      return
    }

    transferStock.mutate(
      { productId, fromLocationId, toLocationId, quantity: qty, remarks: remarks.trim() || undefined },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Transfer stock</DialogTitle>
          <div className="text-xs text-[var(--text-3)]">From {fromLocationName}</div>
        </DialogHeader>

        <div className="flex flex-col gap-3.5 py-2">
          <div>
            <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">Product</Label>
            {productOptions.length === 0 ? (
              <div className="text-xs text-[var(--text-3)]">Nothing at this location to transfer.</div>
            ) : (
              <SearchSelect
                value={productId}
                onChange={handleProductChange}
                placeholder="Select a product"
                searchPlaceholder="Search products…"
                options={productOptions.map((p) => ({
                  value: p.productId,
                  label: p.name,
                  sublabel: p.sku,
                  hint: `${(p.lotQty + p.serialQty).toLocaleString()} available${p.lotCount > 1 ? ` · ${p.lotCount} lots` : ''}`,
                }))}
              />
            )}
          </div>

          <div>
            <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">To location</Label>
            <SearchSelect
              value={toLocationId}
              onChange={setToLocationId}
              placeholder="Select a location"
              searchPlaceholder="Search locations…"
              options={destinations.map((l) => ({
                value: l.id,
                label: l.name,
                sublabel: l.code,
                hint: l.capacity != null ? `${l.currentQty}/${l.capacity}` : undefined,
              }))}
            />
          </div>

          {hasBoth && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant={stockMode === 'SERIAL' ? 'default' : 'outline'}
                className="h-8 flex-1 text-xs"
                onClick={() => setStockMode('SERIAL')}
              >
                Serialized ({serialAvailable.toLocaleString()})
              </Button>
              <Button
                type="button"
                variant={stockMode === 'LOT' ? 'default' : 'outline'}
                className="h-8 flex-1 text-xs"
                onClick={() => setStockMode('LOT')}
              >
                Unserialized ({lotAvailable.toLocaleString()})
              </Button>
            </div>
          )}

          {isSerial ? (
            <SerialPickerField
              productId={productId}
              scope={{ locationId: fromLocationId }}
              totalCount={serialAvailable}
              selected={selectedSerials}
              onChange={setSelectedSerials}
            />
          ) : isLotMode ? (
            <div>
              <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                Lots to move
              </Label>
              <div className="mb-1.5 text-[10.5px] text-[var(--text-3)]">
                Enter how much of each lot was physically moved.
              </div>
              <div className="flex max-h-[220px] flex-col gap-1.5 overflow-y-auto">
                {productLots.map((lot) => (
                  <div
                    key={lot.receivingLineLocationId}
                    className="flex items-center justify-between gap-2 rounded-md border border-[var(--border-2)] px-2.5 py-2"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-xs font-medium text-[var(--text-2)]">{lotLabel(lot)}</div>
                      <div className="truncate text-[10.5px] text-[var(--text-3)]">
                        {lot.quantity.toLocaleString()} available
                        {lot.batchNumber && lot.receivingNumber ? ` · ${lot.receivingNumber}` : ''}
                        {lot.expiryDate ? ` · exp ${new Date(lot.expiryDate).toLocaleDateString()}` : ''}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Input
                        value={lotQuantities[lot.receivingLineLocationId!] ?? ''}
                        onChange={(e) =>
                          setLotQuantities((prev) => ({
                            ...prev,
                            [lot.receivingLineLocationId!]: e.target.value.replace(/[^0-9.]/g, ''),
                          }))
                        }
                        inputMode="decimal"
                        className="w-[84px] font-mono"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setLotQuantities((prev) => ({
                            ...prev,
                            [lot.receivingLineLocationId!]: String(lot.quantity),
                          }))
                        }
                        className="text-[10px] font-semibold text-[var(--brand-accent)]"
                      >
                        MAX
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-1.5 text-[10.5px] font-semibold text-[var(--text-2)]">
                Total to move: {pickedTotal.toLocaleString()} of {lotAvailable.toLocaleString()}
              </div>
            </div>
          ) : (
            <div>
              <Label htmlFor="xfer-qty" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                Quantity
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="xfer-qty"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value.replace(/[^0-9.]/g, ''))}
                  inputMode="decimal"
                  className="w-[120px] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(String(lotAvailable))}
                  className="text-[10px] font-semibold text-[var(--brand-accent)]"
                >
                  MAX ({lotAvailable.toLocaleString()})
                </button>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="xfer-remarks" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
              Remarks
            </Label>
            <Textarea
              id="xfer-remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Optional note for this transfer"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={transferStock.isPending || productOptions.length === 0}>
            <ArrowRightLeft data-icon="inline-start" />
            Transfer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
