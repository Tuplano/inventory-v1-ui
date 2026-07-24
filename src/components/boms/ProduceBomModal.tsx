import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Factory } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { formatNumber } from '@/lib/format'
import { useInventory } from '@/hooks/queries/use-inventory'
import { useLocations } from '@/hooks/queries/use-locations'
import { useProduceBom } from '@/hooks/mutations/use-produce-bom'
import type { BomDetail } from '@/hooks/queries/use-bom'

/** Splits a serials textarea's raw text into trimmed, non-blank entries (one per line or comma). */
function parseSerials(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function ProduceBomModal({
  open,
  onOpenChange,
  bom,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  bom: BomDetail
}) {
  const { data: inventory = [] } = useInventory()
  const { data: locations = [] } = useLocations()
  const produceBom = useProduceBom()

  const [qty, setQty] = useState('1')
  const [locationId, setLocationId] = useState('')
  const [reference, setReference] = useState('')
  const [batchNumber, setBatchNumber] = useState('')
  const [lotNumber, setLotNumber] = useState('')
  const [manufacturingDate, setManufacturingDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [serialsRaw, setSerialsRaw] = useState('')

  useEffect(() => {
    if (!open) return
    setQty('1')
    setLocationId('')
    setReference('')
    setBatchNumber('')
    setLotNumber('')
    setManufacturingDate('')
    setExpiryDate('')
    setSerialsRaw('')
  }, [open])

  const quantityToProduce = Number(qty) || 0
  const isBatchOutput = bom.productTrackingType === 'BATCH'
  const isSerialOutput = bom.productTrackingType === 'SERIAL'
  const serials = parseSerials(serialsRaw)

  const preview = bom.components.map((c) => {
    const required = c.quantity * quantityToProduce
    const available = inventory.find((i) => i.productId === c.componentProductId)?.quantity ?? 0
    return { ...c, required, available, short: available < required }
  })

  const hasShortage = preview.some((p) => p.short)
  const canSubmit =
    quantityToProduce > 0 &&
    !hasShortage &&
    !!locationId &&
    (!isBatchOutput || batchNumber.trim().length > 0) &&
    (!isSerialOutput || (serials.length === quantityToProduce && new Set(serials).size === serials.length))

  function handleSubmit() {
    if (!locationId) {
      toast.warning('Select a destination location')
      return
    }
    if (isBatchOutput && !batchNumber.trim()) {
      toast.warning('Enter a batch number for the produced output')
      return
    }
    if (isSerialOutput) {
      if (new Set(serials).size !== serials.length) {
        toast.warning('Duplicate serial numbers entered')
        return
      }
      if (serials.length !== quantityToProduce) {
        toast.warning(`Entered ${serials.length} serial(s), but quantity to produce is ${quantityToProduce} — they must match`)
        return
      }
    }
    if (!canSubmit) return

    produceBom.mutate(
      {
        bomId: bom.id,
        quantityToProduce,
        locationId,
        reference: reference || undefined,
        batchNumber: isBatchOutput ? batchNumber.trim() : undefined,
        lotNumber: isBatchOutput ? lotNumber.trim() || undefined : undefined,
        manufacturingDate: isBatchOutput ? manufacturingDate || undefined : undefined,
        expiryDate: isBatchOutput ? expiryDate || undefined : undefined,
        serialNumbers: isSerialOutput ? serials : undefined,
      },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-[640px]">
        <DialogHeader className="flex-none flex-row items-center gap-3 border-b border-[var(--border-2)] p-4 pr-12">
          <div className="flex size-8 flex-none items-center justify-center rounded-lg bg-[var(--brand-accent-weak)] text-[var(--brand-accent)]">
            <Factory className="size-[17px]" strokeWidth={1.8} />
          </div>
          <div className="flex-1">
            <DialogTitle className="text-[15px] font-bold">Produce {bom.productName}</DialogTitle>
            <div className="text-xs text-[var(--text-3)]">
              Consumes component stock &amp; adds finished-good stock on hand
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-none flex-wrap items-end gap-4 border-b border-[var(--border-2)] bg-[var(--surface-2)] px-4 py-3">
          <div>
            <Label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-[0.03em] text-[var(--text-3)]">
              Quantity to produce
            </Label>
            <Input
              value={qty}
              onChange={(e) => setQty(e.target.value.replace(/[^0-9.]/g, ''))}
              inputMode="decimal"
              className="w-[120px] font-mono"
            />
          </div>
          <div>
            <Label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-[0.03em] text-[var(--text-3)]">
              Destination location
            </Label>
            <NativeSelect className="w-[200px]" value={locationId} onChange={(e) => setLocationId(e.target.value)}>
              <NativeSelectOption value="">Select a location</NativeSelectOption>
              {locations.map((l) => (
                <NativeSelectOption key={l.id} value={l.id}>
                  {l.name} ({l.code})
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
          <div>
            <Label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-[0.03em] text-[var(--text-3)]">
              Reference
            </Label>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Optional"
              className="w-[180px] font-mono"
            />
          </div>
        </div>

        {isBatchOutput && (
          <div className="flex flex-none flex-wrap items-end gap-3 border-b border-[var(--border-2)] px-4 py-3">
            <div>
              <Label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-[0.03em] text-[var(--text-3)]">
                Batch number
              </Label>
              <Input
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="Required"
                className="w-[160px] font-mono"
              />
            </div>
            <div>
              <Label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-[0.03em] text-[var(--text-3)]">
                Lot number
              </Label>
              <Input
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                placeholder="Optional"
                className="w-[160px] font-mono"
              />
            </div>
            <div>
              <Label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-[0.03em] text-[var(--text-3)]">
                Manufacturing date
              </Label>
              <Input
                type="date"
                value={manufacturingDate}
                onChange={(e) => setManufacturingDate(e.target.value)}
                className="w-[150px] font-mono"
              />
            </div>
            <div>
              <Label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-[0.03em] text-[var(--text-3)]">
                Expiry date
              </Label>
              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-[150px] font-mono"
              />
            </div>
          </div>
        )}

        {isSerialOutput && (
          <div className="flex-none border-b border-[var(--border-2)] px-4 py-3">
            <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">Serial numbers</Label>
            <Textarea
              value={serialsRaw}
              onChange={(e) => setSerialsRaw(e.target.value)}
              placeholder="One serial per line"
              rows={3}
              className="w-full resize-none font-mono text-[12px]"
            />
            <div
              className="mt-1 text-[10.5px] font-semibold"
              style={{
                color:
                  serials.length === 0
                    ? 'var(--text-3)'
                    : serials.length === quantityToProduce && new Set(serials).size === serials.length
                      ? 'var(--green)'
                      : 'var(--red)',
              }}
            >
              {serials.length} of {quantityToProduce || '?'} serial(s) entered
              {new Set(serials).size !== serials.length ? ' · duplicates found' : ''}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-2)]">
                <th className="px-5 py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.03em] text-[var(--text-3)]">
                  Component
                </th>
                <th className="px-2.5 py-2 text-right text-[10.5px] font-semibold uppercase tracking-[0.03em] text-[var(--text-3)]">
                  Per unit
                </th>
                <th className="px-2.5 py-2 text-right text-[10.5px] font-semibold uppercase tracking-[0.03em] text-[var(--text-3)]">
                  Required
                </th>
                <th className="px-5 py-2 text-right text-[10.5px] font-semibold uppercase tracking-[0.03em] text-[var(--text-3)]">
                  On hand
                </th>
              </tr>
            </thead>
            <tbody>
              {preview.map((p) => (
                <tr key={p.id} className="border-b border-[var(--border-2)]">
                  <td className="px-5 py-2.5">
                    <div className="text-[12.5px] font-medium">{p.name}</div>
                    <div className="font-mono text-[10.5px] text-[var(--text-3)]">{p.code}</div>
                  </td>
                  <td className="px-2.5 py-2.5 text-right font-mono text-[12px] text-[var(--text-3)]">{formatNumber(p.quantity)}</td>
                  <td className="px-2.5 py-2.5 text-right font-mono text-[12px] font-semibold">{formatNumber(p.required)}</td>
                  <td
                    className="px-5 py-2.5 text-right font-mono text-[12px] font-semibold"
                    style={{ color: p.short ? 'var(--red)' : 'var(--green)' }}
                  >
                    {formatNumber(p.available)}
                    {p.short ? ' ⚠' : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <DialogFooter className="flex-none flex-row items-center gap-3 rounded-none">
          <div className="flex-1 text-[12px] text-[var(--text-2)]">
            {hasShortage ? (
              <span style={{ color: 'var(--red)' }}>Insufficient stock for one or more components</span>
            ) : (
              <span>
                Will produce <span className="font-mono font-bold text-foreground">{formatNumber(quantityToProduce)}</span> unit(s)
              </span>
            )}
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || produceBom.isPending}>
            <Factory data-icon="inline-start" />
            Produce
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
