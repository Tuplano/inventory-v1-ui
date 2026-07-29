import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchPage } from '@/hooks/queries/paged'
import { useScopeStore } from '@/stores/scope-store'
import type { UserRecord } from '@/entities/users.config'

export function useUsers() {
  const { companyId } = useScopeStore()
  return useInfiniteQuery({
    queryKey: ['users', companyId],
    queryFn: async ({ pageParam }) => fetchPage<UserRecord>('/users', pageParam),
    initialPageParam: '',
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    select: (data) => data.pages.flatMap((p) => p.items),
    enabled: !!companyId,
  })
}
