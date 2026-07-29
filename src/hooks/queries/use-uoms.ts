import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchPage } from '@/hooks/queries/paged'
import { useScopeStore } from '@/stores/scope-store'
import type { UomRecord } from '@/entities/uom.config'

export function useUoms() {
  const companyId = useScopeStore((s) => s.companyId)
  return useInfiniteQuery({
    queryKey: ['uoms', companyId],
    queryFn: async ({ pageParam }) => fetchPage<UomRecord>('/uom', pageParam),
    initialPageParam: '',
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    select: (data) => data.pages.flatMap((p) => p.items),
    enabled: !!companyId,
  })
}
