import { createFileRoute } from '@tanstack/react-router'
import { useDashboard } from '@/hooks/queries/use-dashboard'
import { useCurrentCompany } from '@/hooks/queries/use-companies'
import { useCurrentBranch } from '@/hooks/queries/use-branches'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { StockMovementsChart } from '@/components/dashboard/StockMovementsChart'
import { PoStatusDonutChart } from '@/components/dashboard/PoStatusDonutChart'
import { CategoryStockBarList } from '@/components/dashboard/CategoryStockBarList'
import { LowStockList } from '@/components/dashboard/LowStockList'
import { ExpiringBatchesList } from '@/components/dashboard/ExpiringBatchesList'

export const Route = createFileRoute('/_authed/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const company = useCurrentCompany()
  const branch = useCurrentBranch()
  const { data } = useDashboard()

  if (!data) return null

  return (
    <div className="p-6">
      <div className="mb-4.5">
        <div className="text-[19px] font-bold tracking-tight">Operations overview</div>
        <div className="mt-0.5 text-[12.5px] text-[var(--text-3)]">
          {company?.name} · {branch?.name} · updated 3 min ago
        </div>
      </div>

      <div className="mb-4 grid grid-cols-4 gap-3">
        {data.kpis.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <div className="mb-3 grid grid-cols-[1.55fr_1fr] gap-3">
        <StockMovementsChart data={data.movementDays} />
        <PoStatusDonutChart data={data.poStatusSlices} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <CategoryStockBarList data={data.categoryBars} />
        <LowStockList data={data.lowStock} />
        <ExpiringBatchesList data={data.expiringBatches} />
      </div>
    </div>
  )
}
