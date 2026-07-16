import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

export interface DeleteBranchInput {
  branchId: string
  companyId: string
}

export function useDeleteBranch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ branchId, companyId }: DeleteBranchInput) =>
      apiClient.delete(`/branches/${branchId}`, { headers: { 'x-company-id': companyId } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies', 'rows'] })
      queryClient.invalidateQueries({ queryKey: ['branches'] })
      toast.success('Branch deleted')
    },
    onError: (error) => toast.error(error.message),
  })
}
