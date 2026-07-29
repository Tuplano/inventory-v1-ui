import { useInfiniteQuery } from '@tanstack/react-query'
import { fetchPage } from '@/hooks/queries/paged'
import { useScopeStore } from '@/stores/scope-store'
import { useMyPermissions } from '@/hooks/queries/use-my-permissions'
import type { InventoryItemRecord, InventoryRow } from '@/entities/inventory.config'

export function useInventory() {
  const { companyId, branchId } = useScopeStore()
  const { data: grantedPermissions } = useMyPermissions()
  return useInfiniteQuery({
    queryKey: ['inventory', companyId, branchId],
    queryFn: async ({ pageParam }): Promise<{ items: InventoryRow[]; nextCursor: string | null }> => {
      const page = await fetchPage<InventoryItemRecord>('/inventory-items', pageParam)

      const items = page.items.map((i) => {
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
      return { items, nextCursor: page.nextCursor }
    },
    initialPageParam: '',
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    select: (data) => data.pages.flatMap((p) => p.items),
    enabled: !!companyId && !!branchId && !!grantedPermissions?.has('inventory.view'),
  })
}
