import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency } from '@/lib/format'
import type { PoDetail } from '@/hooks/queries/use-purchase-order'

export function PoLineItemsTable({
  lines,
  grandTotal,
  onCloseLine,
  isClosing,
}: {
  lines: PoDetail['lines']
  grandTotal: number
  onCloseLine: (lineId: string) => void
  isClosing: boolean
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-[var(--border-2)] px-4 py-2.5 text-[13px] font-semibold">Line items</div>
      <Table>
        <TableHeader>
          <TableRow className="bg-[var(--surface-2)] hover:bg-[var(--surface-2)]">
            <TableHead className="text-[11px] font-semibold uppercase text-[var(--text-3)]">Product</TableHead>
            <TableHead className="text-[11px] font-semibold uppercase text-[var(--text-3)]">UOM</TableHead>
            <TableHead className="text-right text-[11px] font-semibold uppercase text-[var(--text-3)]">Ordered</TableHead>
            <TableHead className="text-right text-[11px] font-semibold uppercase text-[var(--text-3)]">Received</TableHead>
            <TableHead className="text-[11px] font-semibold uppercase text-[var(--text-3)]">Progress</TableHead>
            <TableHead className="text-right text-[11px] font-semibold uppercase text-[var(--text-3)]">Unit cost</TableHead>
            <TableHead className="text-right text-[11px] font-semibold uppercase text-[var(--text-3)]">Line total</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.map((l) => {
            const barColor = l.isClosed
              ? 'var(--teal)'
              : l.overReceived
                ? 'var(--red)'
                : l.pct >= 100
                  ? 'var(--green)'
                  : l.pct > 0
                    ? 'var(--amber)'
                    : 'var(--text-3)'
            return (
              <TableRow key={l.id} className="border-b-[var(--border-2)]">
                <TableCell>
                  <div className="font-medium">{l.name}</div>
                  <div className="font-mono text-[10.5px] text-[var(--text-3)]">{l.code}</div>
                </TableCell>
                <TableCell className="font-mono text-[12px] text-[var(--text-2)]">{l.uom}</TableCell>
                <TableCell className="text-right font-mono text-[12px]">{l.ordered.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono text-[12px] font-semibold" style={{ color: l.overReceived ? 'var(--red)' : l.received > 0 ? 'var(--green)' : 'var(--text-3)' }}>
                  {l.received.toLocaleString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-[5px] w-[70px] overflow-hidden rounded-[3px] bg-[var(--surface-3)]">
                      <div className="h-full rounded-[3px]" style={{ width: `${Math.min(100, l.pct)}%`, background: barColor }} />
                    </div>
                    <span className="font-mono text-[11px] text-[var(--text-3)]">{l.isClosed ? 'closed' : `${l.pct}%`}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-[12px]">{formatCurrency(l.cost)}</TableCell>
                <TableCell className="text-right font-mono text-[12px] font-semibold">{formatCurrency(l.total)}</TableCell>
                <TableCell className="text-right">
                  {l.canClose && (
                    <Button
                      variant="outline"
                      size="xs"
                      disabled={isClosing}
                      onClick={() => onCloseLine(l.id)}
                      className="text-[var(--amber)] hover:bg-[var(--amber-weak)]"
                    >
                      Close short
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
        <TableFooter>
          <TableRow className="bg-[var(--surface-2)] hover:bg-[var(--surface-2)]">
            <TableCell colSpan={6} className="text-right text-[12.5px] font-semibold">
              Order total
            </TableCell>
            <TableCell className="text-right font-mono text-[13px] font-bold">{formatCurrency(grandTotal)}</TableCell>
            <TableCell />
          </TableRow>
        </TableFooter>
      </Table>
    </Card>
  )
}
