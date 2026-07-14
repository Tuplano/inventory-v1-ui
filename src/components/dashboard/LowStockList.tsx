import { useNavigate } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import type { LowStockRow } from '@/hooks/queries/use-dashboard'

export function LowStockList({ data }: { data: LowStockRow[] }) {
  const navigate = useNavigate()
  return (
    <Card className="p-4">
      <div className="mb-2.5 flex items-center justify-between">
        <div className="text-[13.5px] font-semibold">Low stock</div>
        <button type="button" onClick={() => navigate({ to: '/inventory' })} className="text-[11.5px] font-medium text-[var(--brand-accent)]">
          View all
        </button>
      </div>
      {data.length === 0 && <div className="text-[12px] text-[var(--text-3)]">Nothing below minimum level.</div>}
      {data.map((row) => (
        <div key={row.code} className="flex items-center gap-2.5 border-b border-[var(--border-2)] py-1.5 last:border-0">
          <span className="size-1.5 flex-none rounded-full" style={{ background: row.out ? 'var(--red)' : 'var(--amber)' }} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12px] font-medium">{row.name}</div>
            <div className="font-mono text-[10.5px] text-[var(--text-3)]">{row.code}</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[12px] font-semibold" style={{ color: row.out ? 'var(--red)' : 'var(--amber)' }}>
              {row.qty.toLocaleString()}
            </div>
            <div className="text-[10px] text-[var(--text-3)]">min {row.min.toLocaleString()}</div>
          </div>
        </div>
      ))}
    </Card>
  )
}
