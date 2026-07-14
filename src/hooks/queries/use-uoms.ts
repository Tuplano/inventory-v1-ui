import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'
import type { UomRecord } from '@/entities/uom.config'

export function useUoms() {
  const companyId = useScopeStore((s) => s.companyId)
  return useQuery({
    queryKey: ['uoms', companyId],
    queryFn: async () => {
      const { data } = await apiClient.get<UomRecord[]>('/uom')
      return data
    },
    enabled: !!companyId,
  })
}
