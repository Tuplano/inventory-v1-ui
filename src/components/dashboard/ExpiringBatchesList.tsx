import { useNavigate } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import { ToneBadge } from '@/components/entity-table/cells'
import type { ExpiringBatchRow } from '@/hooks/queries/use-dashboard'

export function ExpiringBatchesList({ data }: { data: ExpiringBatchRow[] }) {
  const navigate = useNavigate()
  return (
    <Card className="p-4">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="text-[13.5px] font-semibold">Expiring batches</div>
        <button type="button" onClick={() => navigate({ to: '/batches' })} className="text-[11.5px] font-medium text-[var(--brand-accent)]">
          View all
        </button>
      </div>
      {data.length === 0 && <div className="text-[12px] text-[var(--text-3)]">Nothing expiring soon.</div>}
      {data.map((row) => (
        <div key={row.batchNo} className="flex items-center gap-2.5 border-b border-[var(--border-2)] py-1.5 last:border-0">
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12px] font-medium">{row.name}</div>
            <div className="font-mono text-[10.5px] text-[var(--text-3)]">{row.batchNo}</div>
          </div>
          <ToneBadge tone={row.expired ? 'red' : row.daysLeft <= 30 ? 'amber' : 'neutral'} label={row.expired ? 'Expired' : `${row.daysLeft}d`} />
        </div>
      ))}
    </Card>
  )
}
