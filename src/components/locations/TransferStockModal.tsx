import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ArrowRightLeft } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { useLocations } from '@/hooks/queries/use-locations'
import { useTransferStock } from '@/hooks/mutations/use-transfer-stock'
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

  const availableByProduct = contents.reduce<
    Record<string, { name: string; sku: string; qty: number; serialNumbers: string[] | null }>
  >((acc, c) => {
    const entry = acc[c.productId] ?? { name: c.productName, sku: c.productSku, qty: 0, serialNumbers: null }
    entry.qty += c.quantity
    if (c.serialNumbers) entry.serialNumbers = [...(entry.serialNumbers ?? []), ...c.serialNumbers]
    acc[c.productId] = entry
    return acc
  }, {})
  const products = Object.entries(availableByProduct).map(([productId, v]) => ({ productId, ...v }))

  const [productId, setProductId] = useState('')
  const [toLocationId, setToLocationId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [selectedSerials, setSelectedSerials] = useState<string[]>([])
  const [remarks, setRemarks] = useState('')

  useEffect(() => {
    if (!open) return
    setProductId(contents[0]?.productId ?? '')
    setToLocationId('')
    setQuantity('')
    setSelectedSerials([])
    setRemarks('')
  }, [open, contents])

  const destinations = locations.filter((l) => l.id !== fromLocationId && l.isActive)
  const selectedProduct = availableByProduct[productId]
  const available = selectedProduct?.qty ?? 0
  const isSerial = !!selectedProduct?.serialNumbers
  const serialOptions = selectedProduct?.serialNumbers ?? []

  function toggleSerial(sn: string) {
    setSelectedSerials((prev) => (prev.includes(sn) ? prev.filter((s) => s !== sn) : [...prev, sn]))
  }

  function handleProductChange(nextProductId: string) {
    setProductId(nextProductId)
    setSelectedSerials([])
    setQuantity('')
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

    const qty = Number(quantity)
    if (!qty || qty <= 0) {
      toast.warning('Enter a quantity greater than zero')
      return
    }
    if (qty > available) {
      toast.warning(`Only ${available.toLocaleString()} available at ${fromLocationName}`)
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
            {products.length === 0 ? (
              <div className="text-xs text-[var(--text-3)]">Nothing at this location to transfer.</div>
            ) : (
              <NativeSelect className="w-full" value={productId} onChange={(e) => handleProductChange(e.target.value)}>
                {products.map((p) => (
                  <NativeSelectOption key={p.productId} value={p.productId}>
                    {p.name} ({p.sku}) · {p.qty.toLocaleString()} available
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            )}
          </div>

          <div>
            <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">To location</Label>
            <NativeSelect className="w-full" value={toLocationId} onChange={(e) => setToLocationId(e.target.value)}>
              <NativeSelectOption value="">Select a location</NativeSelectOption>
              {destinations.map((l) => (
                <NativeSelectOption key={l.id} value={l.id}>
                  {l.name} ({l.code}){l.capacity != null ? ` · ${l.currentQty}/${l.capacity}` : ''}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          {isSerial ? (
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label className="text-[11.5px] font-semibold text-[var(--text-2)]">Serial numbers</Label>
                <button
                  type="button"
                  onClick={() => setSelectedSerials(selectedSerials.length === serialOptions.length ? [] : [...serialOptions])}
                  className="text-[10px] font-semibold text-[var(--brand-accent)]"
                >
                  {selectedSerials.length === serialOptions.length ? 'Clear all' : 'Select all'}
                </button>
              </div>
              <div className="max-h-[180px] overflow-auto rounded-lg border border-[var(--border-2)]">
                {serialOptions.map((sn) => (
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
                {selectedSerials.length} of {serialOptions.length} selected
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
                  onClick={() => setQuantity(String(available))}
                  className="text-[10px] font-semibold text-[var(--brand-accent)]"
                >
                  MAX ({available.toLocaleString()})
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
          <Button onClick={handleSubmit} disabled={transferStock.isPending || products.length === 0}>
            <ArrowRightLeft data-icon="inline-start" />
            Transfer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
