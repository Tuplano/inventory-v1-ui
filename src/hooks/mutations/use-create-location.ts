import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type { CreateLocationInput } from '@/entities/locations.config'

export function useCreateLocation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateLocationInput) => apiClient.post('/product-locations', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      toast.success('Location created')
    },
    onError: (error) => toast.error(error.message),
  })
}
