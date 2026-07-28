import { useState } from 'react'
import { Search, Undo2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ToneBadge } from '@/components/entity-table/cells'
import { formatCurrency } from '@/lib/format'
import { poStatusTone } from '@/lib/tone'
import { usePurchaseOrders } from '@/hooks/queries/use-purchase-orders'
import { usePurchaseOrder } from '@/hooks/queries/use-purchase-order'
import { ReturnToSupplierModal } from './ReturnToSupplierModal'

/**
 * Standalone entry point for "Return to supplier" from the Supplier Returns list page — a
 * receiving-line-level return can't be built without knowing which PO it's against (remaining
 * qty, batch, serials all live on that PO's receiving lines), so this adds a PO-picker step in
 * front of the exact same ReturnToSupplierModal the PO detail page uses, rather than duplicating
 * its line-editing logic.
 */
export function CreateSupplierReturnDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [selectedPoId, setSelectedPoId] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const { data: poRows = [], isLoading } = usePurchaseOrders()
  const { data: po } = usePurchaseOrder(selectedPoId ?? '')

  function reset() {
    setSelectedPoId(null)
    setQ('')
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset()
    onOpenChange(next)
  }

  if (selectedPoId) {
    if (!po) {
      // Brief window while usePurchaseOrder(selectedPoId) resolves (usually a cache hit if the
      // PO list/detail was already visited this session).
      return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle className="text-[15px] font-bold">Loading purchase order…</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )
    }
    return (
      <ReturnToSupplierModal
        open={open}
        onOpenChange={handleOpenChange}
        po={po}
        supplierName={po.supplierName}
        onBack={() => setSelectedPoId(null)}
      />
    )
  }

  // Any PO that's received at least something is a candidate — an imprecise filter is fine here
  // since ReturnToSupplierModal itself says "Nothing left to return" if it turns out everything
  // on that PO was already sent back.
  const term = q.trim().toLowerCase()
  const eligible = poRows
    .filter((r) => r.progress > 0)
    .filter((r) => !term || r.number.toLowerCase().includes(term) || r.supplierName.toLowerCase().includes(term))

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[80vh] flex-col overflow-hidden p-0 sm:max-w-[560px]">
        <DialogHeader className="flex-none flex-row items-center gap-3 border-b border-[var(--border-2)] p-4 pr-12">
          <div className="flex size-8 flex-none items-center justify-center rounded-lg bg-[var(--red-weak)] text-[var(--red)]">
            <Undo2 className="size-[17px]" strokeWidth={1.8} />
          </div>
          <div>
            <DialogTitle className="text-[15px] font-bold">Return to supplier</DialogTitle>
            <div className="text-xs text-[var(--text-3)]">Pick the purchase order the stock was received against</div>
          </div>
        </DialogHeader>

        <div className="flex-none border-b border-[var(--border-2)] bg-[var(--surface-2)] px-4 py-2 text-[11px] leading-[1.4] text-[var(--text-3)]">
          Only for stock you already <strong className="text-[var(--text-2)]">received on a PO</strong> that's going back to the
          supplier. Nothing to do with a purchase order? Use <strong className="text-[var(--text-2)]">Adjustments</strong> instead.
        </div>

        <div className="relative flex-none border-b border-[var(--border-2)] p-3">
          <Search className="pointer-events-none absolute left-6 top-1/2 size-3.5 -translate-y-1/2 text-[var(--text-3)]" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search PO # or supplier…" className="pl-8" autoFocus />
        </div>

        <div className="flex-1 overflow-auto p-2">
          {isLoading ? (
            <div className="p-6 text-center text-[12.5px] text-[var(--text-3)]">Loading purchase orders…</div>
          ) : eligible.length === 0 ? (
            <div className="p-6 text-center text-[12.5px] text-[var(--text-3)]">
              {term
                ? 'No purchase orders match that search.'
                : 'No purchase orders with received stock yet — receive stock on a PO before returning it.'}
            </div>
          ) : (
            eligible.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedPoId(r.id)}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left hover:bg-[var(--surface-2)]"
              >
                <div className="flex-1">
                  <div className="font-mono text-[12.5px] font-semibold text-[var(--brand-accent-d)]">{r.number}</div>
                  <div className="text-[11.5px] text-[var(--text-3)]">
                    {r.supplierName} · {r.lineCount} lines · {formatCurrency(r.value)}
                  </div>
                </div>
                <ToneBadge tone={poStatusTone(r.status)} label={r.status.replace(/_/g, ' ')} dot />
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
