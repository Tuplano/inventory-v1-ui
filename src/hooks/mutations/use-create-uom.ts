import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type { CreateUomInput } from '@/entities/uom.config'

export function useCreateUom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateUomInput) => apiClient.post('/uom', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uoms'] })
      toast.success('Unit created')
    },
    onError: (error) => toast.error(error.message),
  })
}
