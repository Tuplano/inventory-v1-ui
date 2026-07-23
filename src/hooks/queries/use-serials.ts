import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'
import type { SerialRecord, SerialRow } from '@/entities/serials.config'
import type { SerialStatus } from '@/entities/types'
import type { ProductRecord } from '@/entities/products.config'
import type { ProductLocationRecord } from '@/entities/locations.config'

interface SerialsPage {
  items: SerialRecord[]
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
      const [{ data: page }, { data: products }, locations] = await Promise.all([
        apiClient.get<SerialsPage>('/serial-numbers', {
          params: { status, productId, branchId, q: q || undefined, cursor, limit },
        }),
        apiClient.get<ProductRecord[]>('/products'),
        apiClient
          .get<ProductLocationRecord[]>('/product-locations')
          .then((res) => res.data)
          .catch(() => [] as ProductLocationRecord[]),
      ])

      const rows = page.items.map((s) => {
        const product = products.find((p) => p.id === s.productId)
        const location = locations.find((l) => l.id === s.currentLocationId)
        return {
          ...s,
          code: product?.sku ?? '',
          name: product?.name ?? '',
          locationLabel: location?.code ?? s.currentLocationId ?? '—',
        }
      })

      return { rows, nextCursor: page.nextCursor }
    },
    enabled: !!companyId,
    placeholderData: (prev) => prev,
  })
}
