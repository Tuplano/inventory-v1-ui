import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type { CreateStockMovementInput } from '@/entities/movements.config'

export function useCreateMovement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateStockMovementInput) => apiClient.post('/stock-movements', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movements'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Movement recorded')
    },
    onError: (error) => toast.error(error.message),
  })
}
