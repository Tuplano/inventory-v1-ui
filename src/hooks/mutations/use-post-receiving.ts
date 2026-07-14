import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { mockStore, type PostReceivingInput } from '@/mock'

export function usePostReceiving() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: PostReceivingInput) => mockStore.postReceiving(input),
    onSuccess: (receiving) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-order', receiving.poId] })
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      queryClient.invalidateQueries({ queryKey: ['receivings'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['movements'] })
      queryClient.invalidateQueries({ queryKey: ['batches'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      const units = receiving.lines.reduce((a, l) => a + l.qty, 0)
      toast.success(`${receiving.number} posted · ${units.toLocaleString()} units · ${receiving.lines.length} lines`)
    },
  })
}
