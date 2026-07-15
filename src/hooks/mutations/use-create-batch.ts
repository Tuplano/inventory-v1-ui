import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type { CreateBatchInput } from '@/entities/batches.config'

export function useCreateBatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateBatchInput) =>
      apiClient.post('/batches', {
        ...input,
        manufacturingDate: input.manufacturingDate ? new Date(input.manufacturingDate).toISOString() : undefined,
        expiryDate: input.expiryDate ? new Date(input.expiryDate).toISOString() : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] })
      toast.success('Batch created')
    },
    onError: (error) => toast.error(error.message),
  })
}
