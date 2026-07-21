import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type { ReceivingRecord } from '@/hooks/queries/use-receivings'

export interface PostReceivingLineInput {
  purchaseOrderLineId: string
  receivedQty: number
  unitCost?: number
  /** ID of an existing batch to add this receipt to. Takes precedence over batchNumber. */
  batchId?: string
  /** Lot/batch number typed by the user for BATCH-tracked products; posted as a new batch. */
  batchNumber?: string
  /** Date-only string (YYYY-MM-DD) for a newly created batch; converted to a full ISO datetime before posting. */
  expiryDate?: string
  toLocationId?: string
  /** Required for SERIAL-tracked lines; count must exactly match receivedQty. */
  serialNumbers?: string[]
}

export interface PostReceivingInput {
  purchaseOrderId: string
  referenceNumber?: string
  /** Date-only string (YYYY-MM-DD); converted to a full ISO datetime before posting. */
  receivedDate?: string
  lines: PostReceivingLineInput[]
}

export function usePostReceiving() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: PostReceivingInput) => {
      const { data } = await apiClient.post<ReceivingRecord>('/receivings', {
        purchaseOrderId: input.purchaseOrderId,
        referenceNumber: input.referenceNumber || undefined,
        receivedDate: input.receivedDate ? new Date(input.receivedDate).toISOString() : undefined,
        lines: input.lines.map((l) => ({
          purchaseOrderLineId: l.purchaseOrderLineId,
          receivedQty: l.receivedQty,
          unitCost: l.unitCost,
          batchId: l.batchId || undefined,
          newBatch:
            !l.batchId && l.batchNumber
              ? {
                  batchNumber: l.batchNumber,
                  expiryDate: l.expiryDate ? new Date(l.expiryDate).toISOString() : undefined,
                }
              : undefined,
          toLocationId: l.toLocationId || undefined,
          serialNumbers: l.serialNumbers && l.serialNumbers.length > 0 ? l.serialNumbers : undefined,
        })),
      })
      return data
    },
    onSuccess: (receiving) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-order', receiving.purchaseOrderId] })
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      queryClient.invalidateQueries({ queryKey: ['receivings'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['movements'] })
      queryClient.invalidateQueries({ queryKey: ['batches'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      const units = receiving.lines.reduce((a, l) => a + Number(l.receivedQty), 0)
      toast.success(`${receiving.receivingNumber} posted · ${units.toLocaleString()} units · ${receiving.lines.length} lines`)
    },
    onError: (error) => toast.error(error.message),
  })
}
