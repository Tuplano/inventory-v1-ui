import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

export interface AutoPlacePlacedLine {
  receivingLineId: string | null
  receivingId: string | null
  receivingNumber: string | null
  productId: string
  productName: string
  productSku: string
  toLocationId: string
  toLocationName: string
  toLocationCode: string
  toLocationPosition: string | null
  quantityPlaced: number
  serialNumbers?: string[]
}

export interface AutoPlaceUnplacedLine {
  receivingLineId: string | null
  receivingId: string | null
  receivingNumber: string | null
  productId: string
  productName: string
  productSku: string
  quantityRemaining: number
  serialNumbers?: string[]
}

export interface AutoPlaceResult {
  locationId: string
  placed: AutoPlacePlacedLine[]
  unplaced: AutoPlaceUnplacedLine[]
}

export function useAutoPlaceLocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (locationId: string) => {
      const { data } = await apiClient.post<AutoPlaceResult>(`/product-locations/${locationId}/auto-place`)
      return data
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      queryClient.invalidateQueries({ queryKey: ['location'] })
      queryClient.invalidateQueries({ queryKey: ['movements'] })

      if (result.placed.length === 0 && result.unplaced.length === 0) {
        toast.info('Nothing to place — this location is empty')
        return
      }

      const totalPlaced = result.placed.reduce((sum, l) => sum + l.quantityPlaced, 0)

      if (result.unplaced.length > 0) {
        const totalUnplaced = result.unplaced.reduce((sum, l) => sum + l.quantityRemaining, 0)
        toast.warning(`Placed ${totalPlaced.toLocaleString()} units — ${totalUnplaced.toLocaleString()} units couldn't fit anywhere`)
      } else {
        toast.success(`Placed ${totalPlaced.toLocaleString()} units into storage`)
      }
    },
    onError: (error) => toast.error(error.message),
  })
}
