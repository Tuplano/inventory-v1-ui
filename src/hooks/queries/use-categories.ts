import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchPage } from '@/hooks/queries/paged'
import { useScopeStore } from '@/stores/scope-store'
import type { CategoryRecord } from '@/entities/categories.config'

export function useCategories() {
  const { companyId, branchId } = useScopeStore()
  return useInfiniteQuery({
    queryKey: ['categories', companyId, branchId],
    queryFn: async ({ pageParam }) => fetchPage<CategoryRecord>('/categories', pageParam),
    initialPageParam: '',
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    select: (data) => data.pages.flatMap((p) => p.items),
    enabled: !!companyId && !!branchId,
  })
}
