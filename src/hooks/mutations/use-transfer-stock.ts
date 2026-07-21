import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

export interface TransferStockInput {
  productId: string
  fromLocationId: string
  toLocationId: string
  /** For lot-tracked (BATCH/NONE) products. Mutually exclusive with serialNumbers. */
  quantity?: number
  /** For SERIAL-tracked products — the exact units to move. Mutually exclusive with quantity. */
  serialNumbers?: string[]
}

export interface TransferStockResult {
  productId: string
  fromLocationId: string
  toLocationId: string
  quantity: number
  /** Present only when the transfer was serial-tracked. */
  serialNumbers?: string[]
  lines: { receivingLineId: string; receivingId: string; quantityMoved: number }[]
}

export function useTransferStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: TransferStockInput) => {
      const { data } = await apiClient.post<TransferStockResult>('/product-locations/transfers', input)
      return data
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      queryClient.invalidateQueries({ queryKey: ['location', result.fromLocationId] })
      queryClient.invalidateQueries({ queryKey: ['location', result.toLocationId] })
      queryClient.invalidateQueries({ queryKey: ['movements'] })
      toast.success(
        result.serialNumbers
          ? `Transferred ${result.serialNumbers.length.toLocaleString()} unit(s): ${result.serialNumbers.join(', ')}`
          : `Transferred ${result.quantity.toLocaleString()} units`,
      )
    },
    onError: (error) => toast.error(error.message),
  })
}
