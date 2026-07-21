import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export interface InventoryItemLocationRecord {
  locationId: string
  locationName: string
  locationCode: string
  aisle: string | null
  bay: string | null
  level: string | null
  bin: string | null
  quantity: string
  receivingLineId: string | null
  batchId: string | null
  /** Non-null only for serial-tracked products; the exact units currently at this location. */
  serialNumbers: string[] | null
}

export interface InventoryItemLocationRow {
  locationId: string
  locationName: string
  locationCode: string
  aisle: string | null
  bay: string | null
  level: string | null
  bin: string | null
  quantity: number
  receivingLineId: string | null
  batchId: string | null
  serialNumbers: string[] | null
}

export function useInventoryItemLocations(inventoryItemId: string, enabled = true) {
  return useQuery({
    queryKey: ['inventory-item-locations', inventoryItemId],
    queryFn: async (): Promise<InventoryItemLocationRow[]> => {
      const { data } = await apiClient.get<InventoryItemLocationRecord[]>(`/inventory-items/${inventoryItemId}/locations`)
      return data.map((l) => ({ ...l, quantity: Number(l.quantity) }))
    },
    enabled: enabled && !!inventoryItemId,
  })
}
