import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'
import { useMyPermissions } from '@/hooks/queries/use-my-permissions'
import type { InventoryItemRecord, InventoryRow } from '@/entities/inventory.config'

export function useInventory() {
  const { companyId, branchId } = useScopeStore()
  const { data: grantedPermissions } = useMyPermissions()
  return useQuery({
    queryKey: ['inventory', companyId, branchId],
    queryFn: async (): Promise<InventoryRow[]> => {
      const { data: items } = await apiClient.get<InventoryItemRecord[]>('/inventory-items')

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
          floatingQty: i.floatingQty,
        }
      })
    },
    enabled: !!companyId && !!branchId && !!grantedPermissions?.has('inventory.view'),
  })
}

export function useLowStockCount() {
  const { data } = useInventory()
  return data ? data.filter((i) => i.status !== 'ok').length : 0
}
