import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

export function useDeleteSerial() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/serial-numbers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serials'] })
      toast.success('Serial number deleted')
    },
    onError: (error) => toast.error(error.message),
  })
}
