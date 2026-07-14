import { Card } from '@/components/ui/card'
import type { PoDetail } from '@/hooks/queries/use-purchase-order'

export function PoSummaryCards({ summary }: { summary: PoDetail['summary'] }) {
  return (
    <div className="mb-4 grid grid-cols-4 gap-3">
      {summary.map((s) => (
        <Card key={s.label} className="p-3.5">
          <div className="mb-1 text-[11px] text-[var(--text-3)]">{s.label}</div>
          <div className="font-mono text-[17px] font-bold">{s.value}</div>
        </Card>
      ))}
    </div>
  )
}
