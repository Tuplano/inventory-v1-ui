import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchPage } from '@/hooks/queries/paged'
import { useScopeStore } from '@/stores/scope-store'
import type { ProductLocationRecord } from '@/entities/locations.config'

export function useLocations() {
  const { companyId, branchId } = useScopeStore()
  return useInfiniteQuery({
    queryKey: ['locations', companyId, branchId],
    queryFn: async ({ pageParam }) => fetchPage<ProductLocationRecord>('/product-locations', pageParam),
    initialPageParam: '',
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    select: (data) => data.pages.flatMap((p) => p.items),
    enabled: !!companyId && !!branchId,
  })
}
