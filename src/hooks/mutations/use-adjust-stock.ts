import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

export type AdjustStockReason = 'COUNT_CORRECTION' | 'DEFECTIVE' | 'ISSUE'

export const ADJUST_STOCK_REASON_LABELS: Record<AdjustStockReason, string> = {
  COUNT_CORRECTION: 'Count correction',
  DEFECTIVE: 'Defective',
  ISSUE: 'Issued for use',
}

export interface AdjustStockInput {
  productId: string
  locationId: string
  direction: 'INCREASE' | 'DECREASE'
  reason?: AdjustStockReason
  batchId?: string
  quantity?: number
  serialNumbers?: string[]
  remarks: string
}

export interface AdjustStockResult {
  productId: string
  locationId: string
  direction: 'INCREASE' | 'DECREASE'
  reason: AdjustStockReason | null
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
      const reasonSuffix =
        result.reason && result.reason !== 'COUNT_CORRECTION' ? ` (${ADJUST_STOCK_REASON_LABELS[result.reason]})` : ''
      toast.success(
        result.serialNumbers
          ? `${verb} ${result.serialNumbers.length.toLocaleString()} unit(s): ${result.serialNumbers.join(', ')}${reasonSuffix}`
          : `${verb} ${result.quantity.toLocaleString()} units${reasonSuffix}`,
      )
    },
    onError: (error) => toast.error(error.message),
  })
}
