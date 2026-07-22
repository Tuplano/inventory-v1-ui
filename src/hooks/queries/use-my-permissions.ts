import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'

export function useMyPermissions() {
  const { companyId } = useScopeStore()

  return useQuery({
    queryKey: ['my-permissions', companyId],
    queryFn: async () => {
      const { data } = await apiClient.get<string[]>('/permissions/me')
      return new Set(data)
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  })
}
