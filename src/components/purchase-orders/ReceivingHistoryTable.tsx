import { Truck } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatNumber } from '@/lib/format'
import type { ReceivingHistoryRow } from '@/hooks/queries/use-purchase-order'

export function ReceivingHistoryTable({ receivings }: { receivings: ReceivingHistoryRow[] }) {
  const navigate = useNavigate()
  if (receivings.length === 0) return null

  return (
    <Card className="mt-3.5 overflow-hidden p-0">
      <div className="flex items-center gap-2 border-b border-[var(--border-2)] px-4 py-2.5 text-[13px] font-semibold">
        <Truck className="size-[15px] text-[var(--text-3)]" strokeWidth={1.8} />
        Receiving history
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-[var(--surface-2)] hover:bg-[var(--surface-2)]">
            <TableHead className="text-[11px] font-semibold uppercase text-[var(--text-3)]">Receiving #</TableHead>
            <TableHead className="text-[11px] font-semibold uppercase text-[var(--text-3)]">Supplier ref</TableHead>
            <TableHead className="text-[11px] font-semibold uppercase text-[var(--text-3)]">Date</TableHead>
            <TableHead className="text-[11px] font-semibold uppercase text-[var(--text-3)]">Received by</TableHead>
            <TableHead className="text-right text-[11px] font-semibold uppercase text-[var(--text-3)]">Lines</TableHead>
            <TableHead className="text-right text-[11px] font-semibold uppercase text-[var(--text-3)]">Units</TableHead>
            <TableHead className="text-right text-[11px] font-semibold uppercase text-[var(--text-3)]">Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {receivings.map((r) => (
            <TableRow
              key={r.id}
              onClick={() => navigate({ to: '/receivings', search: { recordId: r.id } })}
              className="cursor-pointer border-b-[var(--border-2)]"
            >
              <TableCell className="font-mono text-[12px] font-semibold text-[var(--brand-accent-d)]">{r.number}</TableCell>
              <TableCell className="font-mono text-[12px] text-[var(--text-2)]">{r.ref}</TableCell>
              <TableCell className="font-mono text-[12px] text-[var(--text-2)]">{r.date}</TableCell>
              <TableCell>{r.by}</TableCell>
              <TableCell className="text-right font-mono text-[12px]">{r.lineCount}</TableCell>
              <TableCell className="text-right font-mono text-[12px] font-semibold text-[var(--green)]">{formatNumber(r.units)}</TableCell>
              <TableCell className="text-right font-mono text-[12px]">{formatCurrency(r.value)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
