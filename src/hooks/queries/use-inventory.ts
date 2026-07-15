import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'
import type { InventoryItemRecord, InventoryRow } from '@/entities/inventory.config'
import type { ProductRecord } from '@/entities/products.config'

export function useInventory() {
  const { companyId, branchId } = useScopeStore()
  return useQuery({
    queryKey: ['inventory', companyId, branchId],
    queryFn: async (): Promise<InventoryRow[]> => {
      const [{ data: items }, { data: products }] = await Promise.all([
        apiClient.get<InventoryItemRecord[]>('/inventory-items'),
        apiClient.get<ProductRecord[]>('/products'),
      ])
      return items.map((i) => {
        const product = products.find((p) => p.id === i.productId)
        const quantity = Number(i.quantity)
        const minStockLevel = i.minStockLevel != null ? Number(i.minStockLevel) : null
        const maxStockLevel = i.maxStockLevel != null ? Number(i.maxStockLevel) : null
        const status: InventoryRow['status'] =
          quantity <= 0 ? 'out' : minStockLevel != null && quantity < minStockLevel ? 'low' : 'ok'
        return {
          id: i.id,
          companyId: i.companyId,
          branchId: i.branchId,
          productId: i.productId,
          quantity,
          minStockLevel,
          maxStockLevel,
          code: product?.sku ?? '',
          name: product?.name ?? '',
          base: product?.baseUom.abbreviation ?? '',
          status,
        }
      })
    },
    enabled: !!companyId && !!branchId,
  })
}

export function useLowStockCount() {
  const { data } = useInventory()
  return data ? data.filter((i) => i.status !== 'ok').length : 0
}
