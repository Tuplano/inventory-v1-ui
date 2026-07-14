import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts'
import { Card } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import type { MovementDay } from '@/hooks/queries/use-dashboard'

const chartConfig = {
  received: { label: 'Received', color: 'var(--brand-accent)' },
  issued: { label: 'Issued', color: 'var(--amber)' },
} satisfies ChartConfig

export function StockMovementsChart({ data }: { data: MovementDay[] }) {
  return (
    <Card className="p-4">
      <div className="mb-3.5 flex items-center justify-between">
        <div>
          <div className="text-[13.5px] font-semibold">Stock movements</div>
          <div className="text-[11px] text-[var(--text-3)]">Units in vs. out · last 14 days</div>
        </div>
        <div className="flex gap-3 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="size-[9px] rounded-[2px] bg-[var(--brand-accent)]" />
            Received
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-[9px] rounded-[2px] bg-[var(--amber)]" />
            Issued
          </span>
        </div>
      </div>
      <ChartContainer config={chartConfig} className="aspect-auto h-[190px] w-full">
        <ComposedChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border-2)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={9} />
          <YAxis tickLine={false} axisLine={false} fontSize={9} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <defs>
            <linearGradient id="fillReceived" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--brand-accent)" stopOpacity={0.18} />
              <stop offset="95%" stopColor="var(--brand-accent)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="received" stroke="var(--brand-accent)" strokeWidth={2} fill="url(#fillReceived)" />
          <Line type="monotone" dataKey="issued" stroke="var(--amber)" strokeWidth={2} strokeDasharray="2 3" dot={false} />
        </ComposedChart>
      </ChartContainer>
    </Card>
  )
}
