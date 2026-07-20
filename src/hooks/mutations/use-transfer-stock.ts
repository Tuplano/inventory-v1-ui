import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

export interface TransferStockInput {
  productId: string
  fromLocationId: string
  toLocationId: string
  quantity: number
}

export interface TransferStockResult {
  productId: string
  fromLocationId: string
  toLocationId: string
  quantity: number
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
      toast.success(`Transferred ${result.quantity.toLocaleString()} units`)
    },
    onError: (error) => toast.error(error.message),
  })
}
