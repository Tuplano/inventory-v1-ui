import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type { CreateRoleInput, RoleRecord } from '@/entities/roles.config'

export function useCreateRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateRoleInput) => {
      const { data } = await apiClient.post<RoleRecord>('/roles', input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success('Role created')
    },
    onError: (error) => toast.error(error.message),
  })
}
