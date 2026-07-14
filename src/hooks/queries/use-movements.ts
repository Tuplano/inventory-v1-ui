import { useQuery } from '@tanstack/react-query'
import { mockStore } from '@/mock'
import { useScopeStore } from '@/stores/scope-store'
import type { MovementRow } from '@/entities/movements.config'

export function useMovements() {
  const { branchId } = useScopeStore()
  return useQuery({
    queryKey: ['movements', branchId],
    queryFn: async (): Promise<MovementRow[]> => {
      const [movements, products] = await Promise.all([mockStore.listMovements(), mockStore.listProducts()])
      return movements
        .filter((m) => m.branchId === branchId)
        .map((m) => {
          const product = products.find((p) => p.id === m.productId)
          return { ...m, code: product?.code ?? '', name: product?.name ?? '' }
        })
    },
  })
}
