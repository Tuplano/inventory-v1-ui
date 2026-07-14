import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'
import type { UserRecord } from '@/entities/users.config'

export function useUsers() {
  const { companyId } = useScopeStore()
  return useQuery({
    queryKey: ['users', companyId],
    queryFn: async (): Promise<UserRecord[]> => {
      const { data } = await apiClient.get<UserRecord[]>('/users')
      return data
    },
    enabled: !!companyId,
  })
}
