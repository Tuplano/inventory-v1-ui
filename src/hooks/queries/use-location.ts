import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { ProductLocationRecord } from '@/entities/locations.config'

export interface LocationContentLine {
  productId: string
  productName: string
  productSku: string
  quantity: number
  receivingId: string
  receivingNumber: string
  receivingLineId: string
  batchId: string | null
  createdAt: string
}

export interface LocationDetail extends ProductLocationRecord {
  available: number | null
  fillPct: number | null
  contents: LocationContentLine[]
}

export function useLocation(id: string) {
  return useQuery({
    queryKey: ['location', id],
    queryFn: async (): Promise<LocationDetail | null> => {
      const [{ data: location }, { data: contents }] = await Promise.all([
        apiClient.get<ProductLocationRecord>(`/product-locations/${id}`),
        apiClient.get<LocationContentLine[]>(`/product-locations/${id}/contents`),
      ])
      if (!location) return null

      return {
        ...location,
        available: location.capacity != null ? location.capacity - location.currentQty : null,
        fillPct: location.capacity != null && location.capacity > 0
          ? Math.min(100, Math.round((location.currentQty / location.capacity) * 100))
          : null,
        contents,
      }
    },
    enabled: !!id,
  })
}
