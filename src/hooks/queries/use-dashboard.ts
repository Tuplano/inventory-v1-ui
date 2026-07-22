import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'
import type { PoStatus } from '@/entities/types'

export interface DashboardKpi {
  label: string
  value: string
  delta: string
  deltaTone: 'green' | 'red' | 'amber' | 'neutral'
  sub: string
}

export interface MovementDay {
  label: string
  received: number
  issued: number
}

export interface PoStatusSlice {
  status: PoStatus
  label: string
  count: number
}

export interface CategoryBar {
  label: string
  value: number
  pct: number
  color: string
}

export interface LowStockRow {
  name: string
  code: string
  qty: number
  min: number
  out: boolean
}

export interface ExpiringBatchRow {
  name: string
  batchNo: string
  daysLeft: number
  expired: boolean
}

export interface DashboardData {
  kpis: DashboardKpi[]
  movementDays: MovementDay[]
  poStatusSlices: PoStatusSlice[]
  categoryBars: CategoryBar[]
  lowStock: LowStockRow[]
  expiringBatches: ExpiringBatchRow[]
}

export function useDashboard() {
  const { companyId, branchId } = useScopeStore()
  return useQuery({
    queryKey: ['dashboard', companyId, branchId],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardData>('/dashboard')
      return data
    },
    enabled: !!companyId && !!branchId,
  })
}
