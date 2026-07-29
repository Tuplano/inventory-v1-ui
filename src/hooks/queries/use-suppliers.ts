import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchPage } from '@/hooks/queries/paged'
import { useScopeStore } from '@/stores/scope-store'
import type { SupplierRecord } from '@/entities/suppliers.config'

export function useSuppliers() {
  const companyId = useScopeStore((s) => s.companyId)
  return useInfiniteQuery({
    queryKey: ['suppliers', companyId],
    queryFn: async ({ pageParam }) => fetchPage<SupplierRecord>('/suppliers', pageParam),
    initialPageParam: '',
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    select: (data) => data.pages.flatMap((p) => p.items),
    enabled: !!companyId,
  })
}
