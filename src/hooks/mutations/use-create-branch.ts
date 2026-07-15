import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

export interface CreateBranchInput {
  companyId: string
  name: string
  code: string
  address?: string
}

export function useCreateBranch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ companyId, ...input }: CreateBranchInput) =>
      apiClient.post('/branches', input, { headers: { 'x-company-id': companyId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies', 'rows'] })
      queryClient.invalidateQueries({ queryKey: ['branches'] })
      toast.success('Branch created')
    },
    onError: (error) => toast.error(error.message),
  })
}
