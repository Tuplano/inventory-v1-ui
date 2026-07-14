import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

export function useClosePoLine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ poId, lineId }: { poId: string; lineId: string }) =>
      apiClient.post(`/purchase-orders/${poId}/lines/${lineId}/close`),
    onSuccess: (_data, { poId }) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-order', poId] })
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      toast.warning('Line short-closed')
    },
    onError: (error) => toast.error(error.message),
  })
}
