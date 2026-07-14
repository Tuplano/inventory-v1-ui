export function formatCurrency(value: number): string {
  return '$' + (value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatNumber(value: number): string {
  return (value ?? 0).toLocaleString('en-US')
}

export function formatDate(dateStr: string): string {
  return dateStr
}

export function daysUntil(dateStr: string, today = new Date('2026-07-13')): number {
  return Math.round((new Date(dateStr).getTime() - today.getTime()) / 86400000)
}
