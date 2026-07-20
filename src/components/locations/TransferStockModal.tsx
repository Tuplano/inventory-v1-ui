import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ArrowRightLeft } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

  const availableByProduct = contents.reduce<Record<string, { name: string; sku: string; qty: number }>>((acc, c) => {
    const entry = acc[c.productId] ?? { name: c.productName, sku: c.productSku, qty: 0 }
    entry.qty += c.quantity
    acc[c.productId] = entry
    return acc
  }, {})
  const products = Object.entries(availableByProduct).map(([productId, v]) => ({ productId, ...v }))

  const [productId, setProductId] = useState('')
  const [toLocationId, setToLocationId] = useState('')
  const [quantity, setQuantity] = useState('')

  useEffect(() => {
    if (!open) return
    setProductId(contents[0]?.productId ?? '')
    setToLocationId('')
    setQuantity('')
  }, [open, contents])

  const destinations = locations.filter((l) => l.id !== fromLocationId && l.isActive)
  const available = availableByProduct[productId]?.qty ?? 0

  function handleSubmit() {
    const qty = Number(quantity)
    if (!productId) {
      toast.warning('Select a product to transfer')
      return
    }
    if (!toLocationId) {
      toast.warning('Select a destination location')
      return
    }
    if (!qty || qty <= 0) {
      toast.warning('Enter a quantity greater than zero')
      return
    }
    if (qty > available) {
      toast.warning(`Only ${available.toLocaleString()} available at ${fromLocationName}`)
      return
    }

    transferStock.mutate(
      { productId, fromLocationId, toLocationId, quantity: qty },
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
              <NativeSelect className="w-full" value={productId} onChange={(e) => setProductId(e.target.value)}>
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
