import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { mockStore } from '@/mock'

export function useCancelPo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => mockStore.cancelPo(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-order', id] })
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.error('PO cancelled')
    },
  })
}
