import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type { UpdateUomInput } from '@/entities/uom.config'

export function useUpdateUom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUomInput }) => apiClient.patch(`/uom/${id}`, input),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['uoms'] })
      queryClient.invalidateQueries({ queryKey: ['uom', id] })
      toast.success('Unit updated')
    },
    onError: (error) => toast.error(error.message),
  })
}
