import { useQuery } from '@tanstack/react-query'
import { mockStore } from '@/mock'
import { useScopeStore } from '@/stores/scope-store'
import type { InventoryRow } from '@/entities/inventory.config'

export function useInventory() {
  const { branchId } = useScopeStore()
  return useQuery({
    queryKey: ['inventory', branchId],
    queryFn: async (): Promise<InventoryRow[]> => {
      const [inventory, products, suppliers] = await Promise.all([
        mockStore.listInventory(),
        mockStore.listProducts(),
        mockStore.listSuppliers(),
      ])
      return inventory
        .filter((i) => i.branchId === branchId)
        .map((i) => {
          const product = products.find((p) => p.id === i.productId)
          const status = i.qty <= 0 ? 'out' : i.qty < i.min ? 'low' : 'ok'
          return {
            ...i,
            code: product?.code ?? '',
            name: product?.name ?? '',
            base: product?.base ?? '',
            supplierName: suppliers.find((s) => s.id === product?.sup)?.name ?? '',
            status,
          }
        })
    },
  })
}

export function useLowStockCount() {
  const { data } = useInventory()
  return data ? data.filter((i) => i.status !== 'ok').length : 0
}
