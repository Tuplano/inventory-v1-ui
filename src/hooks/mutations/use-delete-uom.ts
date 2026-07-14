import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

export function useDeleteUom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/uom/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uoms'] })
      toast.success('Unit deleted')
    },
    onError: (error) => toast.error(error.message),
  })
}
