import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type { UpdateCompanyInput } from '@/entities/companies.config'

export function useUpdateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCompanyInput }) =>
      apiClient.patch(`/companies/${id}`, { ...input, email: input.email || undefined, website: input.website || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      toast.success('Company updated')
    },
    onError: (error) => toast.error(error.message),
  })
}
