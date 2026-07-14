import { useQuery } from '@tanstack/react-query'
import { mockStore } from '@/mock'
import { useScopeStore } from '@/stores/scope-store'
import type { ProductRow } from '@/entities/products.config'

export function useProducts() {
  const { branchId } = useScopeStore()
  return useQuery({
    queryKey: ['products', branchId],
    queryFn: async (): Promise<ProductRow[]> => {
      const [products, suppliers, inventory] = await Promise.all([
        mockStore.listProducts(),
        mockStore.listSuppliers(),
        mockStore.listInventory(),
      ])
      return products.map((p) => {
        const inv = inventory.find((i) => i.productId === p.id && i.branchId === branchId)
        return {
          ...p,
          supplierName: suppliers.find((s) => s.id === p.sup)?.name ?? '',
          inventoryQty: inv?.qty,
          inventoryMin: inv?.min,
          inventoryMax: inv?.max,
          inventoryLoc: inv?.loc,
        }
      })
    },
  })
}
