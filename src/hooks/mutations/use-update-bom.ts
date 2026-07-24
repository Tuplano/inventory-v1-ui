import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

export interface UpdateBomComponentInput {
  componentProductId: string
  quantity: number
}

export interface UpdateBomInput {
  name?: string
  isActive?: boolean
  components?: UpdateBomComponentInput[]
}

export function useUpdateBom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBomInput }) => apiClient.patch(`/boms/${id}`, input),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['bom', id] })
      queryClient.invalidateQueries({ queryKey: ['boms'] })
      toast.success('BOM updated')
    },
    onError: (error) => toast.error(error.message),
  })
}
