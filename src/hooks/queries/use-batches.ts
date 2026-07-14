import { useQuery } from '@tanstack/react-query'
import { mockStore } from '@/mock'
import { useScopeStore } from '@/stores/scope-store'
import { batchStatus, type BatchRow } from '@/entities/batches.config'

export function useBatches() {
  const { branchId } = useScopeStore()
  return useQuery({
    queryKey: ['batches', branchId],
    queryFn: async (): Promise<BatchRow[]> => {
      const [batches, products] = await Promise.all([mockStore.listBatches(), mockStore.listProducts()])
      return batches
        .filter((b) => b.branchId === branchId)
        .map((b) => {
          const product = products.find((p) => p.id === b.productId)
          const { status, daysLeft } = batchStatus(b.remaining, b.expiry)
          return { ...b, code: product?.code ?? '', name: product?.name ?? '', status, daysLeft }
        })
    },
  })
}
