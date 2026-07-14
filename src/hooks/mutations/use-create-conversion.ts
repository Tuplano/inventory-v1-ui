import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type { CreateConversionInput } from '@/entities/uom.config'

export function useCreateConversion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ uomId, input }: { uomId: string; input: CreateConversionInput }) =>
      apiClient.post(`/uom/${uomId}/conversions`, input),
    onSuccess: (_data, { uomId }) => {
      queryClient.invalidateQueries({ queryKey: ['uom', uomId] })
      toast.success('Conversion added')
    },
    onError: (error) => toast.error(error.message),
  })
}
