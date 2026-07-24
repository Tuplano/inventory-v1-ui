import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

export function useGrantBranchAccess() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { userId: string; branchId: string }) => apiClient.post('/company-access/branches', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-access'] })
      toast.success('Branch access granted')
    },
    onError: (error) => toast.error(error.message),
  })
}
