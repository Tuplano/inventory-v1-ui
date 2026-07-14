import { Card } from '@/components/ui/card'
import { toneClasses } from '@/lib/tone'
import type { DashboardKpi } from '@/hooks/queries/use-dashboard'

export function KpiCard({ kpi }: { kpi: DashboardKpi }) {
  const deltaColor = kpi.deltaTone === 'neutral' ? toneClasses('neutral').fg : toneClasses(kpi.deltaTone).fg
  return (
    <Card className="p-3.5">
      <div className="mb-1.5 text-[11.5px] font-medium text-[var(--text-3)]">{kpi.label}</div>
      <div className="flex items-baseline gap-2">
        <div className="text-[25px] font-bold tracking-tight">{kpi.value}</div>
        <div className={`text-[11.5px] font-semibold ${deltaColor}`}>{kpi.delta}</div>
      </div>
      <div className="mt-0.5 text-[11px] text-[var(--text-3)]">{kpi.sub}</div>
    </Card>
  )
}
