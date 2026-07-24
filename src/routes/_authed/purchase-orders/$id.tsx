import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { requirePermission } from '@/lib/route-guards'
import { ChevronDown, Shield, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ToneBadge } from '@/components/entity-table/cells'
import { PoSummaryCards } from '@/components/purchase-orders/PoSummaryCards'
import { PoLineItemsTable } from '@/components/purchase-orders/PoLineItemsTable'
import { ReceivingHistoryTable } from '@/components/purchase-orders/ReceivingHistoryTable'
import { ReceiveStockModal } from '@/components/purchase-orders/ReceiveStockModal'
import { usePurchaseOrder } from '@/hooks/queries/use-purchase-order'
import { useConfirmPo } from '@/hooks/mutations/use-confirm-po'
import { useCancelPo } from '@/hooks/mutations/use-cancel-po'
import { useClosePoLine } from '@/hooks/mutations/use-close-po-line'
import { confirm } from '@/lib/confirm'
import { useAbility } from '@/hooks/use-ability'
import { canAny } from '@/lib/ability'

export const Route = createFileRoute('/_authed/purchase-orders/$id')({
  beforeLoad: (opts) => requirePermission(opts, 'pos'),
  component: PurchaseOrderDetailPage,
})

function PurchaseOrderDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { data: po, isLoading } = usePurchaseOrder(id)
  const confirmPo = useConfirmPo()
  const cancelPo = useCancelPo()
  const closeLine = useClosePoLine()
  const [receiveOpen, setReceiveOpen] = useState(false)
  const ability = useAbility()
  const canManage = canAny(ability, ['purchase-orders.manage'])
  const canReceive = canAny(ability, ['purchase-orders.receive'])

  if (isLoading) return null
  if (!po) {
    return (
      <div className="p-6 text-[13px] text-[var(--text-3)]">Purchase order not found.</div>
    )
  }

  async function handleCancel() {
    if (!po) return
    const ok = await confirm({
      title: `Cancel ${po.number}?`,
      description: 'This action cannot be undone.',
      confirmLabel: 'Cancel PO',
    })
    if (ok) cancelPo.mutate(po.id)
  }

  async function handleCloseLine(lineId: string) {
    if (!po) return
    const ok = await confirm({
      title: 'Close this line short?',
      description: 'The remaining unreceived quantity will be marked as closed. This action cannot be undone.',
      confirmLabel: 'Close short',
    })
    if (ok) closeLine.mutate({ poId: po.id, lineId })
  }

  return (
    <div className="p-6">
      <button
        type="button"
        onClick={() => navigate({ to: '/purchase-orders' })}
        className="mb-3 flex items-center gap-1.5 text-xs text-[var(--text-3)] hover:text-[var(--text-2)]"
      >
        <ChevronDown className="size-3.5 rotate-90" />
        Purchase orders
      </button>

      <div className="mb-4.5 flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2.5">
            <div className="font-mono text-[20px] font-bold tracking-tight">{po.number}</div>
            <ToneBadge tone={po.statusTone} label={po.statusLabel} />
          </div>
          <div className="mt-1 text-[12.5px] text-[var(--text-3)]">
            {po.supplierName} · ordered {po.orderDate} · expected {po.expected}
          </div>
        </div>
        <div className="flex gap-2">
          {po.canConfirm && canManage && (
            <Button onClick={() => confirmPo.mutate(po.id)} disabled={confirmPo.isPending}>
              <Shield data-icon="inline-start" />
              Confirm PO
            </Button>
          )}
          {po.canReceive && canReceive && (
            <Button onClick={() => setReceiveOpen(true)}>
              <Truck data-icon="inline-start" />
              Receive stock
            </Button>
          )}
          {po.canCancel && canManage && (
            <Button variant="outline" className="text-[var(--red)]" onClick={handleCancel} disabled={cancelPo.isPending}>
              Cancel PO
            </Button>
          )}
        </div>
      </div>

      <PoSummaryCards summary={po.summary} />
      <PoLineItemsTable
        lines={po.lines}
        grandTotal={po.grandTotal}
        onCloseLine={canManage ? handleCloseLine : undefined}
        isClosing={closeLine.isPending}
      />
      <ReceivingHistoryTable receivings={po.receivings} />

      {po.canReceive && canReceive && (
        <ReceiveStockModal
          open={receiveOpen}
          onOpenChange={setReceiveOpen}
          po={po}
          supplierName={po.supplierName}
        />
      )}
    </div>
  )
}
