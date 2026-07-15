import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type { CreateCompanyInput } from '@/entities/companies.config'

export function useCreateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCompanyInput) =>
      apiClient.post('/companies', { ...input, email: input.email || undefined, website: input.website || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      toast.success('Company created')
    },
    onError: (error) => toast.error(error.message),
  })
}
