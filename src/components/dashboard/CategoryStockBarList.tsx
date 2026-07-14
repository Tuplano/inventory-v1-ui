import { Card } from '@/components/ui/card'
import type { CategoryBar } from '@/hooks/queries/use-dashboard'

export function CategoryStockBarList({ data }: { data: CategoryBar[] }) {
  return (
    <Card className="p-4">
      <div className="mb-3 text-[13.5px] font-semibold">Stock by category</div>
      {data.map((bar) => (
        <div key={bar.label} className="mb-2.5">
          <div className="mb-1 flex justify-between text-[11.5px]">
            <span className="text-[var(--text-2)]">{bar.label}</span>
            <span className="font-mono font-medium">{bar.value.toLocaleString()}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
            <div className="h-full rounded-full" style={{ width: `${bar.pct}%`, background: bar.color }} />
          </div>
        </div>
      ))}
    </Card>
  )
}
