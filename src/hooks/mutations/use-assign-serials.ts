import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

export interface AssignSerialsInput {
  productId: string
  /** Where the anonymous quantity currently sits — null for floating (unplaced) stock. */
  locationId: string | null
  serialNumbers: string[]
}

export interface AssignSerialsResult {
  productId: string
  locationId: string | null
  quantity: number
  serialNumbers: string[]
  lines: { receivingLineId: string; receivingId: string; quantityAssigned: number }[]
}

export function useAssignSerials() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: AssignSerialsInput) => {
      const { data } = await apiClient.post<AssignSerialsResult>('/product-locations/assign-serials', input)
      return data
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      if (result.locationId) queryClient.invalidateQueries({ queryKey: ['location', result.locationId] })
      queryClient.invalidateQueries({ queryKey: ['unplaced-stock'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-item-locations'] })
      queryClient.invalidateQueries({ queryKey: ['movements'] })
      toast.success(`Assigned ${result.quantity.toLocaleString()} serial number(s)`)
    },
    onError: (error) => toast.error(error.message),
  })
}
