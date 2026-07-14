import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

export function useDeleteConversion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ uomId, conversionId }: { uomId: string; conversionId: string }) =>
      apiClient.delete(`/uom/${uomId}/conversions/${conversionId}`),
    onSuccess: (_data, { uomId }) => {
      queryClient.invalidateQueries({ queryKey: ['uom', uomId] })
      toast.success('Conversion removed')
    },
    onError: (error) => toast.error(error.message),
  })
}
