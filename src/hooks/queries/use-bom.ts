import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { BomComponentRecord, BomRecord } from './use-boms'
import type { TrackingType } from '@/entities/products.config'

/** Display joins embedded by the API on the detail endpoint. */
type BomDetailRecord = Omit<BomRecord, 'product' | 'components'> & {
  product: { name: string; sku: string; trackingType: TrackingType; baseUom: { abbreviation: string } }
  components: (BomComponentRecord & {
    componentProduct: { name: string; sku: string; baseUom: { abbreviation: string } }
    uom: { abbreviation: string } | null
  })[]
}

export interface BomComponentDetail {
  id: string
  componentProductId: string
  name: string
  code: string
  uom: string
  quantity: number
  notes: string | null
}

export interface BomDetail {
  id: string
  productId: string
  productName: string
  productSku: string
  /** Drives what ProduceBomModal asks for: batch fields when BATCH, serial numbers when SERIAL. */
  productTrackingType: TrackingType
  name: string | null
  version: string
  isActive: boolean
  components: BomComponentDetail[]
  createdAt: string
}

export function useBom(id: string) {
  return useQuery({
    queryKey: ['bom', id],
    queryFn: async (): Promise<BomDetail | null> => {
      const { data: bom } = await apiClient.get<BomDetailRecord>(`/boms/${id}`)
      if (!bom) return null

      const components: BomComponentDetail[] = bom.components.map((c) => ({
        id: c.id,
        componentProductId: c.componentProductId,
        name: c.componentProduct.name,
        code: c.componentProduct.sku,
        uom: c.uom?.abbreviation ?? c.componentProduct.baseUom.abbreviation,
        quantity: Number(c.quantity),
        notes: c.notes,
      }))

      return {
        id: bom.id,
        productId: bom.productId,
        productName: bom.product.name,
        productSku: bom.product.sku,
        productTrackingType: bom.product.trackingType,
        name: bom.name,
        version: bom.version,
        isActive: bom.isActive,
        components,
        createdAt: bom.createdAt.slice(0, 10),
      }
    },
    enabled: !!id,
  })
}
