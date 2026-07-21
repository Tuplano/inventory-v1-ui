import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { ProductLocationRecord } from '@/entities/locations.config'

export interface LocationContentLine {
  productId: string
  productName: string
  productSku: string
  quantity: number
  /** Null for serial-tracked lines — see `serialNumbers` instead of a single receiving lot. */
  receivingId: string | null
  receivingNumber: string | null
  receivingLineId: string | null
  batchId: string | null
  /** Non-null only for serial-tracked products; the exact units currently at this location. */
  serialNumbers: string[] | null
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
        // `quantity` is a Prisma Decimal for lot-derived lines (serializes as a wire string) but a
        // plain number for serial-derived lines — normalize both to a real number here.
        contents: contents.map((c) => ({ ...c, quantity: Number(c.quantity) })),
      }
    },
    enabled: !!id,
  })
}
