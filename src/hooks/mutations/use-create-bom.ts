import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type { CreateBomInput } from '@/entities/boms.config'
import type { BomRecord } from '@/hooks/queries/use-boms'

export function useCreateBom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateBomInput) => {
      const { data } = await apiClient.post<BomRecord>('/boms', input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boms'] })
      toast.success('BOM created')
    },
    onError: (error) => toast.error(error.message),
  })
}
