import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatNumber } from '@/lib/format'
import type { BomDetail } from '@/hooks/queries/use-bom'

export function BomComponentsTable({ components }: { components: BomDetail['components'] }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-[var(--border-2)] px-4 py-2.5 text-[13px] font-semibold">Components</div>
      <Table>
        <TableHeader>
          <TableRow className="bg-[var(--surface-2)] hover:bg-[var(--surface-2)]">
            <TableHead className="text-[11px] font-semibold uppercase text-[var(--text-3)]">Product</TableHead>
            <TableHead className="text-[11px] font-semibold uppercase text-[var(--text-3)]">UOM</TableHead>
            <TableHead className="text-right text-[11px] font-semibold uppercase text-[var(--text-3)]">Qty per unit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {components.map((c) => (
            <TableRow key={c.id} className="border-b-[var(--border-2)]">
              <TableCell>
                <div className="font-medium">{c.name}</div>
                <div className="font-mono text-[10.5px] text-[var(--text-3)]">{c.code}</div>
              </TableCell>
              <TableCell className="font-mono text-[12px] text-[var(--text-2)]">{c.uom}</TableCell>
              <TableCell className="text-right font-mono text-[12px] font-semibold">{formatNumber(c.quantity)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
