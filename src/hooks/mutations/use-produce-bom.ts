import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

export interface ProduceBomInput {
  bomId: string
  quantityToProduce: number
  reference?: string
  remarks?: string
}

export interface BomProductionLineResult {
  productId: string
  quantity: number
  stockMovementId: string
}

export interface BomProductionResult {
  bomId: string
  productId: string
  branchId: string
  quantityProduced: number
  consumed: BomProductionLineResult[]
  output: BomProductionLineResult
}

export function useProduceBom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: ProduceBomInput) => {
      const { data } = await apiClient.post<BomProductionResult>('/bom-productions', {
        bomId: input.bomId,
        quantityToProduce: input.quantityToProduce,
        reference: input.reference || undefined,
        remarks: input.remarks || undefined,
      })
      return data
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['bom', result.bomId] })
      queryClient.invalidateQueries({ queryKey: ['boms'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['movements'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success(`Produced ${result.quantityProduced.toLocaleString()} unit(s)`)
    },
    onError: (error) => toast.error(error.message),
  })
}
