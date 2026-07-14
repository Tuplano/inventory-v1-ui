import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { UomWithConversions } from '@/entities/uom.config'

export function useUom(uomId: string | undefined) {
  return useQuery({
    queryKey: ['uom', uomId],
    queryFn: async () => {
      const { data } = await apiClient.get<UomWithConversions>(`/uom/${uomId}`)
      return data
    },
    enabled: !!uomId,
  })
}
