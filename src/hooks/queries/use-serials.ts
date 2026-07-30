import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'
import type { SerialRecord, SerialRow } from '@/entities/serials.config'
import type { SerialStatus } from '@/entities/types'

/** Display joins embedded by the API — no client-side lookup-table fetches needed. */
type SerialListItem = SerialRecord & {
  product: { sku: string; name: string }
  currentLocation: { code: string } | null
}

interface SerialsPage {
  items: SerialListItem[]
  nextCursor: string | null
}

export interface UseSerialsParams {
  status?: SerialStatus
  productId?: string
  branchId?: string
  q?: string
  cursor?: string
  limit?: number
}

export interface SerialsResult {
  rows: SerialRow[]
  nextCursor: string | null
}

export function useSerials(params: UseSerialsParams = {}) {
  const { companyId, branchId: scopeBranchId } = useScopeStore()
  const { status, productId, branchId, q, cursor, limit = 25 } = params

  return useQuery({
    queryKey: ['serials', companyId, scopeBranchId, status, productId, branchId, q, cursor, limit],
    queryFn: async (): Promise<SerialsResult> => {
      const { data: page } = await apiClient.get<SerialsPage>('/serial-numbers', {
        params: { status, productId, branchId, q: q || undefined, cursor, limit },
      })

      const rows = page.items.map((s) => ({
        ...s,
        code: s.product.sku,
        name: s.product.name,
        locationLabel: s.currentLocation?.code ?? s.currentLocationId ?? '—',
      }))

      return { rows, nextCursor: page.nextCursor }
    },
    enabled: !!companyId,
    placeholderData: (prev) => prev,
  })
}
