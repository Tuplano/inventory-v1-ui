import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

export interface ProduceBomInput {
  bomId: string
  quantityToProduce: number
  /** Destination for the produced output — required, but stock can still be moved via transfers afterward. */
  locationId: string
  /** Required when the output product is BATCH-tracked; a new batch is always created. */
  batchNumber?: string
  lotNumber?: string
  manufacturingDate?: string
  expiryDate?: string
  /** Required when the output product is SERIAL-tracked; length must equal quantityToProduce. */
  serialNumbers?: string[]
  reference?: string
  remarks?: string
}

export interface BomProductionConsumedLine {
  productId: string
  locationId: string
  batchId: string | null
  quantity: number
  stockMovementId: string
}

export interface BomProductionOutput {
  productId: string
  locationId: string
  quantity: number
  batchId: string | null
  serialNumbers?: string[]
}

export interface BomProductionResult {
  bomId: string
  productId: string
  branchId: string
  quantityProduced: number
  consumed: BomProductionConsumedLine[]
  output: BomProductionOutput
}

export function useProduceBom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: ProduceBomInput) => {
      const { data } = await apiClient.post<BomProductionResult>('/bom-productions', {
        bomId: input.bomId,
        quantityToProduce: input.quantityToProduce,
        locationId: input.locationId,
        batchNumber: input.batchNumber || undefined,
        lotNumber: input.lotNumber || undefined,
        manufacturingDate: input.manufacturingDate || undefined,
        expiryDate: input.expiryDate || undefined,
        serialNumbers: input.serialNumbers,
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
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      queryClient.invalidateQueries({ queryKey: ['batches'] })

      // Every location touched — the output destination plus wherever each component was
      // consumed from — had its currentQty change, not just the output's.
      const touchedLocationIds = new Set([result.output.locationId, ...result.consumed.map((c) => c.locationId)])
      for (const locationId of touchedLocationIds) {
        if (locationId) queryClient.invalidateQueries({ queryKey: ['location', locationId] })
      }

      toast.success(`Produced ${result.quantityProduced.toLocaleString()} unit(s)`)
    },
    onError: (error) => toast.error(error.message),
  })
}
