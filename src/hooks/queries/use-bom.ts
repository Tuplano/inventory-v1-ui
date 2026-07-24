import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { BomRecord } from './use-boms'
import type { ProductRecord } from '@/entities/products.config'
import type { UomRecord } from '@/entities/uom.config'

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
      const [{ data: bom }, { data: products }, { data: uoms }] = await Promise.all([
        apiClient.get<BomRecord>(`/boms/${id}`),
        apiClient.get<ProductRecord[]>('/products'),
        apiClient.get<UomRecord[]>('/uom'),
      ])
      if (!bom) return null

      const product = products.find((p) => p.id === bom.productId)

      const components: BomComponentDetail[] = bom.components.map((c) => {
        const componentProduct = products.find((p) => p.id === c.componentProductId)
        const uom = c.uomId ? uoms.find((u) => u.id === c.uomId) : undefined
        return {
          id: c.id,
          componentProductId: c.componentProductId,
          name: componentProduct?.name ?? '',
          code: componentProduct?.sku ?? '',
          uom: uom?.abbreviation ?? componentProduct?.baseUom.abbreviation ?? '',
          quantity: Number(c.quantity),
          notes: c.notes,
        }
      })

      return {
        id: bom.id,
        productId: bom.productId,
        productName: product?.name ?? '',
        productSku: product?.sku ?? '',
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
