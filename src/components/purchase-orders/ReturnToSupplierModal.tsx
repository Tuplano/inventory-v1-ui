import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency, formatNumber } from '@/lib/format'
import { useBatches } from '@/hooks/queries/use-batches'
import { usePostSupplierReturn } from '@/hooks/mutations/use-post-supplier-return'
import { useAuthStore } from '@/stores/auth-store'
import type { PoDetail } from '@/hooks/queries/use-purchase-order'

interface LineState {
  qty: string
  cost: string
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

export function ReturnToSupplierModal({
  open,
  onOpenChange,
  po,
  supplierName,
  onBack,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  po: PoDetail
  supplierName: string
  /** When set, shows a "‹ Choose a different PO" link — used by CreateSupplierReturnDialog's
   * PO-picker flow so the user can back out to step 1 without closing the whole dialog. */
  onBack?: () => void
}) {
  const { data: batches = [] } = useBatches()
  const postReturn = usePostSupplierReturn()
  const user = useAuthStore((s) => s.user)

  const returnableLines = po.returnableLines.filter((l) => l.remaining > 0)

  const [ref, setRef] = useState('')
  const [reason, setReason] = useState('')
  const [lines, setLines] = useState<Record<string, LineState>>({})

  useEffect(() => {
    if (!open) return
    setRef('')
    setReason('')
    const initial: Record<string, LineState> = {}
    returnableLines.forEach((l) => {
      initial[l.id] = {
        qty: '0',
        cost: l.unitCost.toFixed(2),
        serials: '',
      }
    })
    setLines(initial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, po])

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

    // Serials are mandatory for SERIAL-tracked lines — a return has to name exactly which units
    // go back so their status can flip to RETURNED_TO_SUPPLIER, unlike receiving where an
    // anonymous lot is fine.
    const missingSerials = activeLines.find(([lineId]) => {
      const line = returnableLines.find((l) => l.id === lineId)
      return line?.track === 'SERIAL' && parseSerials(lines[lineId]?.serials ?? '').length === 0
    })
    if (missingSerials) {
      const line = returnableLines.find((l) => l.id === missingSerials[0])
      toast.warning(`Enter the serial number(s) being returned for ${line?.name}`)
      return
    }

    const serialMismatch = activeLines.find(([lineId, v]) => {
      const line = returnableLines.find((l) => l.id === lineId)
      if (line?.track !== 'SERIAL') return false
      return parseSerials(v.serials).length !== (Number(v.qty) || 0)
    })
    if (serialMismatch) {
      const line = returnableLines.find((l) => l.id === serialMismatch[0])
      toast.warning(`Enter exactly ${Number(serialMismatch[1].qty) || 0} serial number(s) for ${line?.name}`)
      return
    }

    const duplicateSerials = activeLines.find(([lineId, v]) => {
      const line = returnableLines.find((l) => l.id === lineId)
      if (line?.track !== 'SERIAL') return false
      const serials = parseSerials(v.serials)
      return new Set(serials).size !== serials.length
    })
    if (duplicateSerials) {
      const line = returnableLines.find((l) => l.id === duplicateSerials[0])
      toast.warning(`Duplicate serial numbers entered for ${line?.name}`)
      return
    }

    postReturn.mutate(
      {
        purchaseOrderId: po.id,
        referenceNumber: ref || undefined,
        reason: reason || undefined,
        lines: activeLines.map(([lineId, v]) => {
          const line = returnableLines.find((l) => l.id === lineId)
          const isSerial = line?.track === 'SERIAL'
          return {
            receivingLineId: lineId,
            quantity: isSerial ? undefined : Number(v.qty) || 0,
            serialNumbers: isSerial ? parseSerials(v.serials) : undefined,
            unitCost: Number(v.cost) || undefined,
          }
        }),
      },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-[960px]">
        <DialogHeader className="flex-none flex-row items-center gap-3 border-b border-[var(--border-2)] p-4 pr-12">
          <div className="flex size-8 flex-none items-center justify-center rounded-lg bg-[var(--red-weak)] text-[var(--red)]">
            <Undo2 className="size-[17px]" strokeWidth={1.8} />
          </div>
          <div className="flex-1">
            <DialogTitle className="text-[15px] font-bold">Return to supplier</DialogTitle>
            <div className="text-xs text-[var(--text-3)]">
              Against {po.number} · {supplierName} — number assigned on post · posts RETURN_TO_SUPPLIER movements &amp; debits stock on hand
            </div>
          </div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex-none text-[11.5px] font-semibold text-[var(--brand-accent)] hover:underline"
            >
              ‹ Choose a different PO
            </button>
          )}
        </DialogHeader>

        <div className="flex flex-none items-end gap-4 border-b border-[var(--border-2)] bg-[var(--surface-2)] px-4 py-3">
          <div>
            <Label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-[0.03em] text-[var(--text-3)]">
              Reference #
            </Label>
            <Input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="RTN-00000" className="w-[160px] font-mono" />
          </div>
          <div className="flex-1">
            <Label className="mb-1 block text-[10.5px] font-semibold uppercase tracking-[0.03em] text-[var(--text-3)]">
              Reason
            </Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Damaged, wrong item, excess stock…" className="w-full" />
          </div>
          <div className="pb-1 text-[11px] text-[var(--text-3)]">
            Returned by <span className="font-semibold text-[var(--text-2)]">{user?.name}</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {returnableLines.length === 0 ? (
            <div className="p-6 text-center text-[12.5px] text-[var(--text-3)]">Nothing left to return on this purchase order.</div>
          ) : (
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-[var(--border-2)]">
                  <th className="px-5 py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.03em] text-[var(--text-3)]">Product</th>
                  <th className="px-2.5 py-2 text-right text-[10.5px] font-semibold uppercase tracking-[0.03em] text-[var(--text-3)]">Rec'd</th>
                  <th className="px-2.5 py-2 text-right text-[10.5px] font-semibold uppercase tracking-[0.03em] text-[var(--text-3)]">Rem.</th>
                  <th className="px-2.5 py-2 text-center text-[10.5px] font-semibold uppercase tracking-[0.03em] text-[var(--text-3)]">Return</th>
                  <th className="px-2.5 py-2 text-center text-[10.5px] font-semibold uppercase tracking-[0.03em] text-[var(--text-3)]">Unit cost</th>
                  <th className="px-5 py-2 text-center text-[10.5px] font-semibold uppercase tracking-[0.03em] text-[var(--text-3)]">Batch / Serials</th>
                </tr>
              </thead>
              <tbody>
                {returnableLines.map((l) => {
                  const state = lines[l.id] ?? { qty: '0', cost: '0', serials: '' }
                  const over = Number(state.qty) > l.remaining
                  const isBatch = l.track === 'BATCH'
                  const isSerial = l.track === 'SERIAL'
                  const serialCount = isSerial ? parseSerials(state.serials).length : 0
                  const serialNeeded = Number(state.qty) || 0
                  const batch = l.batchId ? batches.find((b) => b.id === l.batchId) : undefined
                  return (
                    <tr key={l.id} className="border-b border-[var(--border-2)]">
                      <td className="px-5 py-2.5">
                        <div className="text-[12.5px] font-medium">{l.name}</div>
                        <div className="font-mono text-[10.5px] text-[var(--text-3)]">
                          {l.code} · {l.uom} ·{' '}
                          <span style={{ color: isBatch ? 'var(--teal)' : isSerial ? 'var(--violet)' : 'var(--text-3)' }}>{l.track}</span>
                          {' · via '}
                          {l.receivingNumber}
                        </div>
                      </td>
                      <td className="px-2.5 py-2.5 text-right font-mono text-[12px] text-[var(--text-3)]">{formatNumber(l.receivedQty)}</td>
                      <td className="px-2.5 py-2.5 text-right font-mono text-[12px] font-semibold" style={{ color: 'var(--amber)' }}>
                        {formatNumber(l.remaining)}
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
                            onClick={() => setField(l.id, 'qty', String(Math.max(0, l.remaining)))}
                            className="text-[10px] font-semibold text-[var(--brand-accent)]"
                          >
                            MAX
                          </button>
                        </div>
                        {over && <div className="mt-0.5 text-[10px] font-semibold text-[var(--red)]">Exceeds remaining ⚠</div>}
                      </td>
                      <td className="px-2.5 py-2.5 text-center">
                        <Input value={state.cost} onChange={(e) => setField(l.id, 'cost', e.target.value)} inputMode="decimal" className="w-[70px] text-right font-mono" />
                      </td>
                      <td className="px-5 py-2.5 text-center">
                        {isBatch ? (
                          <Input
                            value={batch ? `${batch.batchNumber} · ${formatNumber(batch.remainingQty)} left` : '—'}
                            disabled
                            className="mx-auto w-[190px] font-mono text-[11.5px]"
                          />
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
                              style={{
                                color:
                                  serialCount === 0
                                    ? 'var(--text-3)'
                                    : serialCount === serialNeeded
                                      ? 'var(--green)'
                                      : 'var(--amber)',
                              }}
                            >
                              {serialCount}/{serialNeeded} entered
                            </div>
                          </div>
                        ) : (
                          <Input value="" placeholder="n/a" disabled className="mx-auto w-[100px] font-mono text-[11.5px]" />
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <DialogFooter className="flex-none flex-row items-center gap-3 rounded-none">
          <div className="flex-1 text-[12px] text-[var(--text-2)]">
            Returning <span className="font-mono font-bold text-foreground">{formatNumber(totalUnits)}</span> units ·{' '}
            <span className="font-mono font-bold text-foreground">{lineCount}</span> lines · value{' '}
            <span className="font-mono font-bold text-foreground">{formatCurrency(totalValue)}</span>
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={postReturn.isPending || returnableLines.length === 0}>
            <Undo2 data-icon="inline-start" />
            Post return
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
