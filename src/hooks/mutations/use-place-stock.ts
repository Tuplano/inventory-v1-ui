import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

export interface PlaceStockInput {
  locationId: string
  productId: string
  /** For lot-tracked (BATCH/NONE) products. Mutually exclusive with serialNumbers. */
  quantity?: number
  /** For SERIAL-tracked products — the exact units to place. Mutually exclusive with quantity. */
  serialNumbers?: string[]
}

export interface PlaceStockResult {
  productId: string
  toLocationId: string
  quantity: number
  /** Present only when the placement was serial-tracked. */
  serialNumbers?: string[]
  lines: { receivingLineId: string; receivingId: string; quantityPlaced: number }[]
}

export function usePlaceStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ locationId, ...body }: PlaceStockInput) => {
      const { data } = await apiClient.post<PlaceStockResult>(`/product-locations/${locationId}/place`, body)
      return data
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      queryClient.invalidateQueries({ queryKey: ['location', result.toLocationId] })
      queryClient.invalidateQueries({ queryKey: ['unplaced-stock'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['movements'] })
      toast.success(
        result.serialNumbers
          ? `Placed ${result.serialNumbers.length.toLocaleString()} unit(s): ${result.serialNumbers.join(', ')}`
          : `Placed ${result.quantity.toLocaleString()} units`,
      )
    },
    onError: (error) => toast.error(error.message),
  })
}
