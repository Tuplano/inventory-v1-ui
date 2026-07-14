import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'
import type { SerialRecord, SerialRow } from '@/entities/serials.config'
import type { ProductRecord } from '@/entities/products.config'
import type { ProductLocationRecord } from '@/entities/locations.config'

export function useSerials() {
  const { companyId, branchId } = useScopeStore()
  return useQuery({
    queryKey: ['serials', companyId, branchId],
    queryFn: async (): Promise<SerialRow[]> => {
      const [{ data: serials }, { data: products }, locations] = await Promise.all([
        apiClient.get<SerialRecord[]>('/serial-numbers'),
        apiClient.get<ProductRecord[]>('/products'),
        apiClient
          .get<ProductLocationRecord[]>('/product-locations')
          .then((res) => res.data)
          .catch(() => [] as ProductLocationRecord[]),
      ])
      return serials.map((s) => {
        const product = products.find((p) => p.id === s.productId)
        const location = locations.find((l) => l.id === s.currentLocationId)
        return {
          ...s,
          code: product?.code ?? '',
          name: product?.name ?? '',
          locationLabel: location?.code ?? s.currentLocationId ?? '—',
        }
      })
    },
    enabled: !!companyId,
  })
}
