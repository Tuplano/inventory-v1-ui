import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Inbox } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { useUnplacedStock } from '@/hooks/queries/use-unplaced-stock'
import { usePlaceStock } from '@/hooks/mutations/use-place-stock'
import { SerialPickerField } from '@/components/locations/SerialPickerField'

export function PlaceStockModal({
  open,
  onOpenChange,
  toLocationId,
  toLocationName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  toLocationId: string
  toLocationName: string
}) {
  const { data: contents = [] } = useUnplacedStock()
  const placeStock = usePlaceStock()

  const availableByProduct = contents.reduce<
    Record<string, { name: string; sku: string; qty: number; isSerialTracked: boolean }>
  >((acc, c) => {
    const entry = acc[c.productId] ?? { name: c.productName, sku: c.productSku, qty: 0, isSerialTracked: false }
    entry.qty += c.quantity
    if (c.isSerialTracked) entry.isSerialTracked = true
    acc[c.productId] = entry
    return acc
  }, {})
  const products = Object.entries(availableByProduct).map(([productId, v]) => ({ productId, ...v }))

  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [selectedSerials, setSelectedSerials] = useState<string[]>([])

  useEffect(() => {
    if (!open) return
    setProductId(contents[0]?.productId ?? '')
    setQuantity('')
    setSelectedSerials([])
  }, [open, contents])

  const selectedProduct = availableByProduct[productId]
  const available = selectedProduct?.qty ?? 0
  const isSerial = !!selectedProduct?.isSerialTracked

  function handleProductChange(nextProductId: string) {
    setProductId(nextProductId)
    setSelectedSerials([])
    setQuantity('')
  }

  function handleSubmit() {
    if (!productId) {
      toast.warning('Select a product to place')
      return
    }

    if (isSerial) {
      if (selectedSerials.length === 0) {
        toast.warning('Select at least one serial number to place')
        return
      }
      placeStock.mutate(
        { locationId: toLocationId, productId, serialNumbers: selectedSerials },
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
      toast.warning(`Only ${available.toLocaleString()} unplaced units available`)
      return
    }

    placeStock.mutate(
      { locationId: toLocationId, productId, quantity: qty },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Place received stock</DialogTitle>
          <div className="text-xs text-[var(--text-3)]">Into {toLocationName}</div>
        </DialogHeader>

        <div className="flex flex-col gap-3.5 py-2">
          <div>
            <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">Product</Label>
            {products.length === 0 ? (
              <div className="text-xs text-[var(--text-3)]">No unplaced stock at this branch.</div>
            ) : (
              <NativeSelect className="w-full" value={productId} onChange={(e) => handleProductChange(e.target.value)}>
                {products.map((p) => (
                  <NativeSelectOption key={p.productId} value={p.productId}>
                    {p.name} ({p.sku}) · {p.qty.toLocaleString()} unplaced
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            )}
          </div>

          {isSerial ? (
            <SerialPickerField
              productId={productId}
              scope={{ unplaced: true }}
              totalCount={available}
              selected={selectedSerials}
              onChange={setSelectedSerials}
            />
          ) : (
            <div>
              <Label htmlFor="place-qty" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                Quantity
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="place-qty"
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
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={placeStock.isPending || products.length === 0}>
            <Inbox data-icon="inline-start" />
            Place
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
