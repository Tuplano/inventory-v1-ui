import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

export interface AdjustStockInput {
  productId: string
  locationId: string
  direction: 'INCREASE' | 'DECREASE'
  /** Required when the product is BATCH-tracked; ignored otherwise. */
  batchId?: string
  /** For NONE/BATCH-tracked products. Mutually exclusive with serialNumbers. */
  quantity?: number
  /** For SERIAL-tracked products — existing serials to remove (DECREASE) or new ones to add (INCREASE). */
  serialNumbers?: string[]
  remarks: string
}

export interface AdjustStockResult {
  productId: string
  locationId: string
  direction: 'INCREASE' | 'DECREASE'
  quantity: number
  batchId: string | null
  serialNumbers?: string[]
  lines: { receivingLineId: string | null; quantityAdjusted: number }[]
}

export function useAdjustStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: AdjustStockInput) => {
      const { data } = await apiClient.post<AdjustStockResult>('/product-locations/adjustments', input)
      return data
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      queryClient.invalidateQueries({ queryKey: ['location', result.locationId] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['movements'] })
      queryClient.invalidateQueries({ queryKey: ['batches'] })
      const verb = result.direction === 'INCREASE' ? 'Increased' : 'Decreased'
      toast.success(
        result.serialNumbers
          ? `${verb} ${result.serialNumbers.length.toLocaleString()} unit(s): ${result.serialNumbers.join(', ')}`
          : `${verb} ${result.quantity.toLocaleString()} units`,
      )
    },
    onError: (error) => toast.error(error.message),
  })
}
