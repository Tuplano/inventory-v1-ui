import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type { CreateSerialInput } from '@/entities/serials.config'

export function useCreateSerial() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateSerialInput) => apiClient.post('/serial-numbers', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serials'] })
      toast.success('Serial number created')
    },
    onError: (error) => toast.error(error.message),
  })
}
