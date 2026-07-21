import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'
import type { LocationContentLine } from './use-location'

/** Stock that was received before a toLocationId existed (or otherwise received unplaced) —
 * counted in on-hand quantity but not yet assigned to any physical location. */
export function useUnplacedStock() {
  const { companyId, branchId } = useScopeStore()
  return useQuery({
    queryKey: ['unplaced-stock', companyId, branchId],
    queryFn: async (): Promise<LocationContentLine[]> => {
      const { data } = await apiClient.get<LocationContentLine[]>('/product-locations/unplaced')
      // `quantity` is a Prisma Decimal for lot-derived lines (serializes as a wire string) but a
      // plain number for serial-derived lines — normalize both to a real number here.
      return data.map((c) => ({ ...c, quantity: Number(c.quantity) }))
    },
    enabled: !!companyId && !!branchId,
  })
}
