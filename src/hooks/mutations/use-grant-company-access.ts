import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

export function useGrantCompanyAccess() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { userId: string; hasAllBranches?: boolean }) => apiClient.post('/company-access', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-access'] })
      toast.success('Company access granted')
    },
    onError: (error) => toast.error(error.message),
  })
}
