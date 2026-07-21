import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency, formatNumber } from '@/lib/format'
import { useLocations } from '@/hooks/queries/use-locations'
import { useBatches } from '@/hooks/queries/use-batches'
import { usePostReceiving } from '@/hooks/mutations/use-post-receiving'
import { useAuthStore } from '@/stores/auth-store'
import type { PoDetail } from '@/hooks/queries/use-purchase-order'

const NEW_BATCH_OPTION = '__new__'

interface LineState {
  qty: string
  cost: string
  /** '__new__' means "create a new batch" (batch typed in `batch`); otherwise the id of an existing batch. */
  batchId: string
  batch: string
  /** Expiry date (YYYY-MM-DD) for a newly created batch. */
  expiry: string
  locationId: string
  /** Raw textarea contents for SERIAL-tracked lines — one serial number per line. */
  serials: string
}

/** Splits a serials textarea's raw text into trimmed, non-blank entries (one per line or comma). */
function parseSerials(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function ReceiveStockModal({
  open,
  onOpenChange,
  po,
  supplierName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  po: PoDetail
  supplierName: string
}) {
  const { data: locations = [] } = useLocations()
  const { data: batches = [] } = useBatches()
  const postReceiving = usePostReceiving()
  const user = useAuthStore((s) => s.user)
  const hasLocations = locations.length > 0

  const [ref, setRef] = useState('')
  const [date, setDate] = useState('2026-07-13')
  const [lines, setLines] = useState<Record<string, LineState>>({})

  useEffect(() => {
    if (!open) return
    setRef('')
    setDate('2026-07-13')
    const defaultLocationId = locations.find((l) => l.type === 'RECEIVING' && l.isActive)?.id ?? locations[0]?.id ?? ''
    const initial: Record<string, LineState> = {}
    po.lines.forEach((l) => {
      const remaining = Math.max(0, l.ordered - l.received)
      initial[l.id] = {
        qty: String(remaining),
        cost: l.cost.toFixed(2),
        batchId: NEW_BATCH_OPTION,
        batch: '',
        expiry: '',
        locationId: defaultLocationId,
        serials: '',
      }
    })
    setLines(initial)
  }, [open, po, locations])

  function setField(lineId: string, field: keyof LineState, raw: string) {
    let value = raw
    if (field === 'qty') value = raw.replace(/[^0-9]/g, '')
    if (field === 'cost') value = raw.replace(/[^0-9.]/g, '')
    setLines((prev) => ({ ...prev, [lineId]: { ...prev[lineId], [field]: value } }))
  }

  const totalUnits = Object.values(lines).reduce((a, v) => a + (Number(v.qty) || 0), 0)
  const totalValue = Object.values(lines).reduce((a, v) => a + (Number(v.qty) || 0) * (Number(v.cost) || 0), 0)
  const lineCount = Object.values(lines).filter((v) => Number(v.qty) > 0).length

  function handleSubmit() {
    const activeLines = Object.entries(lines).filter(([, v]) => Number(v.qty) > 0)

    if (activeLines.length === 0) {
      toast.warning('Enter a quantity on at least one line')
      return
    }

    const missingBatch = activeLines.find(([lineId, v]) => {
      const line = po.lines.find((l) => l.id === lineId)
      return line?.track === 'BATCH' && v.batchId === NEW_BATCH_OPTION && !v.batch.trim()
    })
    if (missingBatch) {
      toast.warning('Select an existing batch or enter a new batch / lot # for batch-tracked lines')
      return
    }

    const serialMismatch = activeLines.find(([lineId, v]) => {
      const line = po.lines.find((l) => l.id === lineId)
      if (line?.track !== 'SERIAL') return false
      return parseSerials(v.serials).length !== (Number(v.qty) || 0)
    })
    if (serialMismatch) {
      const line = po.lines.find((l) => l.id === serialMismatch[0])
      toast.warning(`Enter exactly ${Number(serialMismatch[1].qty) || 0} serial number(s) for ${line?.name}`)
      return
    }

    const duplicateSerials = activeLines.find(([lineId, v]) => {
      const line = po.lines.find((l) => l.id === lineId)
      if (line?.track !== 'SERIAL') return false
      const serials = parseSerials(v.serials)
      return new Set(serials).size !== serials.length
    })
    if (duplicateSerials) {
      const line = po.lines.find((l) => l.id === duplicateSerials[0])
      toast.warning(`Duplicate serial numbers entered for ${line?.name}`)
      return
    }

    postReceiving.mutate(
      {
        purchaseOrderId: po.id,
        referenceNumber: ref || undefined,
        receivedDate: date || undefined,
        lines: activeLines.map(([lineId, v]) => ({
          purchaseOrderLineId: lineId,
          receivedQty: Number(v.qty) || 0,
          unitCost: Number(v.cost) || 0,
          batchId: v.batchId !== NEW_BATCH_OPTION ? v.batchId : undefined,
          batchNumber: v.batchId === NEW_BATCH_OPTION ? v.batch.trim() || undefined : undefined,
          expiryDate: v.batchId === NEW_BATCH_OPTION ? v.expiry || undefined : undefined,
          toLocationId: v.locationId || undefined,
          serialNumbers: parseSerials(v.serials),
        })),
      },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-[1040px]">
        <DialogHeader className="flex-none flex-row items-center gap-3 border-b border-[var(--border-2)] p-4 pr-12">
          <div className="flex size-8 flex-none items-center justify-center rounded-lg bg-[var(--brand-accent-weak)] text-[var(--brand-accent)]">
            <Truck className="size-[17px]" strokeWidth={1.8} />
          </div>
          <div className="flex-1">
            <DialogTitle className="text-[15px] font-bold">New receiving</DialogTitle>
            <div className="text-xs text-[var(--text-3)]">
              Against {po.number} · {supplierName} — number assigned on post · posts RECEIVING movements &amp; updates stock on hand
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-none items-end gap-4 border-b border-[var(--border-2)] bg-[var(--surface-2)] px-4 py-3">
          <div>
            <Label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-[0.03em] text-[var(--text-3)]">
              Supplier DR / Invoice ref
            </Label>
            <Input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="DR-00000" className="w-[180px] font-mono" />
          </div>
          <div>
            <Label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-[0.03em] text-[var(--text-3)]">
              Received date
            </Label>
            <Input value={date} onChange={(e) => setDate(e.target.value)} className="w-[130px] font-mono" />
          </div>
          <div className="flex-1" />
          <div className="pb-1 text-[11px] text-[var(--text-3)]">
            Received by <span className="font-semibold text-[var(--text-2)]">{user?.name}</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border-2)]">
                <th className="px-5 py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.03em] text-[var(--text-3)]">Product</th>
                <th className="px-2.5 py-2 text-right text-[10.5px] font-semibold uppercase tracking-[0.03em] text-[var(--text-3)]">Ord.</th>
                <th className="px-2.5 py-2 text-right text-[10.5px] font-semibold uppercase tracking-[0.03em] text-[var(--text-3)]">Rem.</th>
                <th className="px-2.5 py-2 text-center text-[10.5px] font-semibold uppercase tracking-[0.03em] text-[var(--text-3)]">Receive</th>
                <th className="px-2.5 py-2 text-center text-[10.5px] font-semibold uppercase tracking-[0.03em] text-[var(--text-3)]">Unit cost</th>
                <th className="px-2.5 py-2 text-center text-[10.5px] font-semibold uppercase tracking-[0.03em] text-[var(--text-3)]">Batch / Serials</th>
                {hasLocations && (
                  <th className="px-5 py-2 text-center text-[10.5px] font-semibold uppercase tracking-[0.03em] text-[var(--text-3)]">To location</th>
                )}
              </tr>
            </thead>
            <tbody>
              {po.lines.map((l) => {
                const remaining = l.ordered - l.received
                const state = lines[l.id] ?? { qty: '0', cost: '0', batchId: NEW_BATCH_OPTION, batch: '', expiry: '', locationId: '', serials: '' }
                const over = Number(state.qty) > remaining
                const isBatch = l.track === 'BATCH'
                const isSerial = l.track === 'SERIAL'
                const serialCount = isSerial ? parseSerials(state.serials).length : 0
                const serialNeeded = Number(state.qty) || 0
                const productBatches = isBatch
                  ? batches.filter(
                      (b) => b.productId === l.productId && b.isActive && (b.purchaseOrderId === null || b.purchaseOrderId === po.id),
                    )
                  : []
                return (
                  <tr key={l.id} className="border-b border-[var(--border-2)]">
                    <td className="px-5 py-2.5">
                      <div className="text-[12.5px] font-medium">{l.name}</div>
                      <div className="font-mono text-[10.5px] text-[var(--text-3)]">
                        {l.code} · {l.uom} ·{' '}
                        <span style={{ color: isBatch ? 'var(--teal)' : l.track === 'SERIAL' ? 'var(--violet)' : 'var(--text-3)' }}>{l.track}</span>
                      </div>
                    </td>
                    <td className="px-2.5 py-2.5 text-right font-mono text-[12px] text-[var(--text-3)]">{formatNumber(l.ordered)}</td>
                    <td
                      className="px-2.5 py-2.5 text-right font-mono text-[12px] font-semibold"
                      style={{ color: over ? 'var(--red)' : remaining > 0 ? 'var(--amber)' : 'var(--green)' }}
                    >
                      {formatNumber(remaining)}
                      {over ? ' ⚠' : ''}
                    </td>
                    <td className="px-2.5 py-2.5 text-center">
                      <div className="inline-flex items-center gap-1">
                        <Input
                          value={state.qty}
                          onChange={(e) => setField(l.id, 'qty', e.target.value)}
                          inputMode="numeric"
                          className="w-[58px] text-right font-mono"
                          style={{ borderColor: over ? 'var(--red)' : undefined }}
                        />
                        <button
                          type="button"
                          onClick={() => setField(l.id, 'qty', String(Math.max(0, remaining)))}
                          className="text-[10px] font-semibold text-[var(--brand-accent)]"
                        >
                          MAX
                        </button>
                      </div>
                    </td>
                    <td className="px-2.5 py-2.5 text-center">
                      <Input value={state.cost} onChange={(e) => setField(l.id, 'cost', e.target.value)} inputMode="decimal" className="w-[70px] text-right font-mono" />
                    </td>
                    <td className="px-2.5 py-2.5 text-center">
                      {isBatch ? (
                        <div className="mx-auto flex w-[190px] flex-col items-center gap-1">
                          <NativeSelect
                            size="sm"
                            value={state.batchId}
                            onChange={(e) => setField(l.id, 'batchId', e.target.value)}
                            className="w-full"
                          >
                            <NativeSelectOption value={NEW_BATCH_OPTION}>+ New batch</NativeSelectOption>
                            {productBatches.map((b) => (
                              <NativeSelectOption key={b.id} value={b.id}>
                                {b.batchNumber} · exp {b.expiryDate ? b.expiryDate.slice(0, 10) : '—'} · {formatNumber(b.remainingQty)} left
                              </NativeSelectOption>
                            ))}
                          </NativeSelect>
                          {state.batchId === NEW_BATCH_OPTION && (
                            <div className="flex w-full gap-1">
                              <Input
                                value={state.batch}
                                onChange={(e) => setField(l.id, 'batch', e.target.value)}
                                placeholder="lot #"
                                className="w-0 flex-1 font-mono text-[11.5px]"
                              />
                              <Input
                                type="date"
                                value={state.expiry}
                                onChange={(e) => setField(l.id, 'expiry', e.target.value)}
                                className="w-0 flex-[1.2] font-mono text-[11.5px]"
                              />
                            </div>
                          )}
                        </div>
                      ) : isSerial ? (
                        <div className="mx-auto flex w-[190px] flex-col items-center gap-1">
                          <Textarea
                            value={state.serials}
                            onChange={(e) => setField(l.id, 'serials', e.target.value)}
                            placeholder="One serial per line"
                            rows={2}
                            className="w-full resize-none font-mono text-[11px]"
                          />
                          <div
                            className="w-full text-left text-[10px] font-semibold"
                            style={{ color: serialCount === serialNeeded && serialNeeded > 0 ? 'var(--green)' : 'var(--amber)' }}
                          >
                            {serialCount}/{serialNeeded} entered
                          </div>
                        </div>
                      ) : (
                        <Input value="" placeholder="n/a" disabled className="mx-auto w-[100px] font-mono text-[11.5px]" />
                      )}
                    </td>
                    {hasLocations && (
                      <td className="px-5 py-2.5 text-center">
                        <NativeSelect
                          size="sm"
                          value={state.locationId}
                          onChange={(e) => setField(l.id, 'locationId', e.target.value)}
                          className="w-[130px]"
                        >
                          <NativeSelectOption value="">No location</NativeSelectOption>
                          {locations.map((loc) => (
                            <NativeSelectOption key={loc.id} value={loc.id}>
                              {loc.code}
                            </NativeSelectOption>
                          ))}
                        </NativeSelect>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <DialogFooter className="flex-none flex-row items-center gap-3 rounded-none">
          <div className="flex-1 text-[12px] text-[var(--text-2)]">
            Posting <span className="font-mono font-bold text-foreground">{formatNumber(totalUnits)}</span> units ·{' '}
            <span className="font-mono font-bold text-foreground">{lineCount}</span> lines · value{' '}
            <span className="font-mono font-bold text-foreground">{formatCurrency(totalValue)}</span>
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={postReceiving.isPending}>
            <Truck data-icon="inline-start" />
            Post receiving
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
