import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

export function useDeleteBom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/boms/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boms'] })
      toast.success('BOM deleted')
    },
    onError: (error) => toast.error(error.message),
  })
}
