import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { mockStore } from '@/mock'

export function useClosePoLine() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ poId, lineId }: { poId: string; lineId: string }) => mockStore.closePoLine(poId, lineId),
    onSuccess: (_data, { poId }) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-order', poId] })
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      toast.warning('Line short-closed')
    },
  })
}
