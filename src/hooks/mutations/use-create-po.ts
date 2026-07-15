import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type { CreatePurchaseOrderInput } from '@/entities/purchase-orders.config'
import type { PurchaseOrderRecord } from '@/hooks/queries/use-purchase-orders'

export function useCreatePo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreatePurchaseOrderInput) => {
      const { data } = await apiClient.post<PurchaseOrderRecord>('/purchase-orders', {
        ...input,
        expectedDate: input.expectedDate ? new Date(input.expectedDate).toISOString() : undefined,
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Purchase order created')
    },
    onError: (error) => toast.error(error.message),
  })
}
