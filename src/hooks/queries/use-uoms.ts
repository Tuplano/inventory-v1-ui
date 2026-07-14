import { useQuery } from '@tanstack/react-query'
import { mockStore } from '@/mock'
import type { UomRow } from '@/entities/uom.config'

export function useUoms() {
  return useQuery({
    queryKey: ['uoms'],
    queryFn: async (): Promise<UomRow[]> => {
      const [uoms, conversions] = await Promise.all([mockStore.listUoms(), mockStore.listConversions()])
      return uoms.map((u) => {
        const list = conversions.filter((c) => c.from === u.code || c.to === u.code)
        return { ...u, conversionCount: list.length, conversionsList: list }
      })
    },
  })
}
