import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'
import type { InventoryItemRecord, InventoryRow } from '@/entities/inventory.config'
import type { LocationContentLine } from './use-location'

export function useInventory() {
  const { companyId, branchId } = useScopeStore()
  return useQuery({
    queryKey: ['inventory', companyId, branchId],
    queryFn: async (): Promise<InventoryRow[]> => {
      const [{ data: items }, { data: unplaced }] = await Promise.all([
        apiClient.get<InventoryItemRecord[]>('/inventory-items'),
        apiClient.get<LocationContentLine[]>('/product-locations/unplaced'),
      ])

      const floatingByProduct = new Map<string, number>()
      for (const line of unplaced) {
        floatingByProduct.set(line.productId, (floatingByProduct.get(line.productId) ?? 0) + Number(line.quantity))
      }

      return items.map((i) => {
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
          code: i.product.sku,
          name: i.product.name,
          barcode: i.product.barcode,
          base: i.product.baseUom.abbreviation,
          status,
          trackingType: i.product.trackingType,
          floatingQty: floatingByProduct.get(i.productId) ?? 0,
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
