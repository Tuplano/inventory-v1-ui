import { useQuery } from '@tanstack/react-query'
import { mockStore } from '@/mock'
import { useScopeStore } from '@/stores/scope-store'
import type { ReceivingRow } from '@/entities/receivings.config'

export function useReceivings() {
  const { branchId } = useScopeStore()
  return useQuery({
    queryKey: ['receivings', branchId],
    queryFn: async (): Promise<ReceivingRow[]> => {
      const [receivings, suppliers, products] = await Promise.all([
        mockStore.listReceivings(),
        mockStore.listSuppliers(),
        mockStore.listProducts(),
      ])
      const productCode = (productId: string) => products.find((p) => p.id === productId)?.code ?? productId
      return receivings
        .filter((r) => r.branchId === branchId)
        .map((r) => ({
          ...r,
          supplierName: suppliers.find((s) => s.id === r.sup)?.name ?? '',
          lineCount: r.lines.length,
          units: r.lines.reduce((a, l) => a + l.qty, 0),
          value: r.lines.reduce((a, l) => a + l.qty * l.cost, 0),
          productCode,
        }))
    },
  })
}
