import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type { UpdateSerialInput } from '@/entities/serials.config'

export function useUpdateSerial() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSerialInput }) =>
      apiClient.patch(`/serial-numbers/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serials'] })
      toast.success('Serial number updated')
    },
    onError: (error) => toast.error(error.message),
  })
}
