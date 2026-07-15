import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type { UpdateBatchInput } from '@/entities/batches.config'

export function useUpdateBatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBatchInput }) =>
      apiClient.patch(`/batches/${id}`, {
        ...input,
        expiryDate: input.expiryDate ? new Date(input.expiryDate).toISOString() : input.expiryDate,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] })
      toast.success('Batch updated')
    },
    onError: (error) => toast.error(error.message),
  })
}
