import { useQuery } from '@tanstack/react-query'
import { mockStore } from '@/mock'
import { useScopeStore } from '@/stores/scope-store'
import type { PurchaseOrderRow } from '@/entities/purchase-orders.config'

export function usePurchaseOrders() {
  const { branchId } = useScopeStore()
  return useQuery({
    queryKey: ['purchase-orders', branchId],
    queryFn: async (): Promise<PurchaseOrderRow[]> => {
      const [pos, suppliers] = await Promise.all([mockStore.listPurchaseOrders(), mockStore.listSuppliers()])
      return pos
        .filter((p) => p.branchId === branchId)
        .map((p) => {
          const value = p.lines.reduce((a, l) => a + l.ordered * l.cost, 0)
          const ordered = p.lines.reduce((a, l) => a + l.ordered, 0)
          const received = p.lines.reduce((a, l) => a + l.received, 0)
          return {
            ...p,
            supplierName: suppliers.find((s) => s.id === p.sup)?.name ?? '',
            lineCount: p.lines.length,
            value,
            progress: ordered ? Math.round((received / ordered) * 100) : 0,
          }
        })
    },
  })
}
