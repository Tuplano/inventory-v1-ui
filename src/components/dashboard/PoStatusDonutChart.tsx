import { Cell, Pie, PieChart } from 'recharts'
import { Card } from '@/components/ui/card'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { poStatusTone, toneColor } from '@/lib/tone'
import type { PoStatusSlice } from '@/hooks/queries/use-dashboard'

const chartConfig = {} satisfies ChartConfig

export function PoStatusDonutChart({ data }: { data: PoStatusSlice[] }) {
  const nonEmpty = data.filter((d) => d.count > 0)
  const total = data.reduce((a, d) => a + d.count, 0)

  return (
    <Card className="p-4">
      <div className="mb-0.5 text-[13.5px] font-semibold">Purchase orders</div>
      <div className="mb-2.5 text-[11px] text-[var(--text-3)]">By status · open pipeline</div>
      <div className="flex items-center gap-4">
        <ChartContainer config={chartConfig} className="aspect-square h-[118px] w-[118px] flex-none">
          <PieChart>
            <Pie data={nonEmpty} dataKey="count" nameKey="label" innerRadius={38} outerRadius={58} strokeWidth={0}>
              {nonEmpty.map((slice) => (
                <Cell key={slice.status} fill={toneColor(poStatusTone(slice.status))} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="flex-1">
          {data.map((slice) => (
            <div key={slice.status} className="flex items-center gap-1.5 py-[3px] text-[11.5px]">
              <span className="size-2 flex-none rounded-[2px]" style={{ background: toneColor(poStatusTone(slice.status)) }} />
              <span className="flex-1 text-[var(--text-2)]">{slice.label}</span>
              <span className="font-mono font-semibold">{slice.count}</span>
            </div>
          ))}
        </div>
      </div>
      {total === 0 && <div className="mt-2 text-center text-[11px] text-[var(--text-3)]">No purchase orders yet</div>}
    </Card>
  )
}
