import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

export function useRevokeCompanyAccess() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (accessId: string) => apiClient.delete(`/company-access/${accessId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-access'] })
      toast.success('Company access removed')
    },
    onError: (error) => toast.error(error.message),
  })
}
