import type { ReactNode } from 'react'
import type { Tone } from '@/mock/types'
import { toneClasses } from '@/lib/tone'
import { formatCurrency, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

export function MonoCell({
  value,
  color,
  weight = 400,
}: {
  value: ReactNode
  color?: string
  weight?: number
}) {
  return (
    <span className="font-mono text-[12px]" style={{ color, fontWeight: weight }}>
      {value}
    </span>
  )
}

export function SubCell({ main, sub, subMono = true }: { main: ReactNode; sub: ReactNode; subMono?: boolean }) {
  return (
    <div className="leading-[1.25]">
      <div className="font-medium">{main}</div>
      <div className={cn('text-[10.5px] text-[var(--text-3)]', subMono && 'font-mono')}>{sub}</div>
    </div>
  )
}

export function ToneBadge({ tone, label, dot }: { tone: Tone; label: ReactNode; dot?: boolean }) {
  const c = toneClasses(tone)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
        c.bg,
        c.fg,
      )}
    >
      {dot && <span className={cn('size-[5px] rounded-full', c.fg.replace('text-', 'bg-'))} />}
      {label}
    </span>
  )
}

export function StockCell({ value, pct, tone }: { value: ReactNode; pct: number; tone: Tone }) {
  const c = toneClasses(tone)
  return (
    <div className="flex items-center justify-end gap-2.5">
      <div className="h-[5px] w-14 overflow-hidden rounded-[3px] bg-[var(--surface-3)]">
        <div className={cn('h-full rounded-[3px]', c.fg.replace('text-', 'bg-'))} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
      </div>
      <span className="min-w-[38px] text-right font-mono text-[12px] font-semibold">{value}</span>
    </div>
  )
}

export function NumberCell({ value, format }: { value: number; format?: 'currency' }) {
  return <span className="font-mono text-[12px]">{format === 'currency' ? formatCurrency(value) : formatNumber(value)}</span>
}
