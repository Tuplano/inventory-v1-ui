import { useQuery } from '@tanstack/react-query'
import { mockStore } from '@/mock'
import { useScopeStore } from '@/stores/scope-store'
import type { SerialRow } from '@/entities/serials.config'

export function useSerials() {
  const { branchId } = useScopeStore()
  return useQuery({
    queryKey: ['serials', branchId],
    queryFn: async (): Promise<SerialRow[]> => {
      const [serials, products] = await Promise.all([mockStore.listSerials(), mockStore.listProducts()])
      return serials
        .filter((s) => s.branchId === branchId)
        .map((s) => {
          const product = products.find((p) => p.id === s.productId)
          return { ...s, code: product?.code ?? '', name: product?.name ?? '' }
        })
    },
  })
}
