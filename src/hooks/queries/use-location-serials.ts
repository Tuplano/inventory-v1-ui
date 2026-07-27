import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'

interface SerialNumbersPage {
  items: { id: string; serialNumber: string }[]
  nextCursor: string | null
}

/** Where to look for a product's serials: a specific bin, or the branch's unplaced pool (received
 * but never assigned a location — see useUnplacedStock). */
export type SerialScope = { locationId: string } | { unplaced: true }

/** Paginated serial numbers for one product within one scope — powers the read-only "view
 * serials" popover and the interactive serial picker used by Adjust/Transfer/Place. Deliberately
 * narrower than useSerials (entities/serials.config page): that hook also joins in the full
 * products/locations lists for display columns we don't need here, since the product and scope
 * are already fixed by the caller. */
export function useLocationSerials(
  productId: string,
  scope: SerialScope,
  q: string,
  cursor: string | undefined,
  enabled: boolean,
) {
  const { branchId } = useScopeStore()
  const scopeKey = 'locationId' in scope ? scope.locationId : 'unplaced'

  return useQuery({
    queryKey: ['location-serials', productId, scopeKey, q, cursor],
    queryFn: async () => {
      const { data } = await apiClient.get<SerialNumbersPage>('/serial-numbers', {
        params: {
          productId,
          status: 'IN_STOCK',
          q: q || undefined,
          cursor,
          limit: 20,
          ...('locationId' in scope ? { locationId: scope.locationId } : { unplaced: true, branchId }),
        },
      })
      return data
    },
    enabled: enabled && ('locationId' in scope ? true : !!branchId),
    placeholderData: (prev) => prev,
  })
}
