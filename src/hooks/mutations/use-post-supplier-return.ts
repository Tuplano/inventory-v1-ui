import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type { SupplierReturnRecord } from '@/hooks/queries/use-supplier-returns'

export interface PostSupplierReturnLineInput {
  receivingLineId: string
  /** XOR with serialNumbers — quantity for NONE/BATCH-tracked lines. */
  quantity?: number
  /** XOR with quantity — required for SERIAL-tracked lines. */
  serialNumbers?: string[]
  /** Optional — defaults to the receiving line's unitCost if omitted. */
  unitCost?: number
}

export interface PostSupplierReturnInput {
  purchaseOrderId: string
  referenceNumber?: string
  reason?: string
  notes?: string
  lines: PostSupplierReturnLineInput[]
}

export function usePostSupplierReturn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: PostSupplierReturnInput) => {
      const { data } = await apiClient.post<SupplierReturnRecord>('/supplier-returns', {
        purchaseOrderId: input.purchaseOrderId,
        referenceNumber: input.referenceNumber || undefined,
        reason: input.reason || undefined,
        notes: input.notes || undefined,
        lines: input.lines.map((l) => ({
          receivingLineId: l.receivingLineId,
          quantity: l.quantity,
          serialNumbers: l.serialNumbers && l.serialNumbers.length > 0 ? l.serialNumbers : undefined,
          unitCost: l.unitCost,
        })),
      })
      return data
    },
    onSuccess: (supplierReturn) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-order', supplierReturn.purchaseOrderId] })
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      queryClient.invalidateQueries({ queryKey: ['supplier-returns'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['movements'] })
      queryClient.invalidateQueries({ queryKey: ['batches'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      const units = supplierReturn.lines.reduce((a, l) => a + Number(l.quantity), 0)
      toast.success(`${supplierReturn.returnNumber} posted · ${units.toLocaleString()} units · ${supplierReturn.lines.length} lines`)
    },
    onError: (error) => toast.error(error.message),
  })
}
