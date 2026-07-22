import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'

export interface BatchCapacity {
  productId: string
  /** Sum of InventoryItem.quantity for this product across every branch in the company. */
  recordedQty: number
  /** Sum of remainingQty across this product's existing batches. */
  batchedQty: number
  /** How much of recordedQty isn't yet claimed by a batch. */
  room: number
}

export function useBatchCapacity(productId: string) {
  const companyId = useScopeStore((s) => s.companyId)
  return useQuery({
    queryKey: ['batch-capacity', companyId, productId],
    queryFn: async (): Promise<BatchCapacity> => {
      const { data } = await apiClient.get<BatchCapacity>('/batches/capacity', { params: { productId } })
      return data
    },
    enabled: !!companyId && !!productId,
  })
}
