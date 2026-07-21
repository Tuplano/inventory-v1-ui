import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

export interface AutoPlaceProposedLine {
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
  quantityProposed: number
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

export interface ProposeAutoPlaceResult {
  locationId: string
  proposed: AutoPlaceProposedLine[]
  unplaced: AutoPlaceUnplacedLine[]
}

// Read-only: nothing gets moved by calling this. It only suggests destinations for stock
// still sitting at a RECEIVING location — recording an actual move is a separate transfer.
export function useProposeAutoPlace() {
  return useMutation({
    mutationFn: async (locationId: string) => {
      const { data } = await apiClient.get<ProposeAutoPlaceResult>(`/product-locations/${locationId}/auto-place/propose`)
      return data
    },
    onSuccess: (result) => {
      if (result.proposed.length === 0 && result.unplaced.length === 0) {
        toast.info('Nothing to propose — this location is empty')
        return
      }

      const totalProposed = result.proposed.reduce((sum, l) => sum + l.quantityProposed, 0)

      if (result.unplaced.length > 0) {
        const totalUnplaced = result.unplaced.reduce((sum, l) => sum + l.quantityRemaining, 0)
        toast.warning(`Proposed ${totalProposed.toLocaleString()} units — ${totalUnplaced.toLocaleString()} units had no bin with room`)
      } else {
        toast.success(`Proposed destinations for ${totalProposed.toLocaleString()} units`)
      }
    },
    onError: (error) => toast.error(error.message),
  })
}
