import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { requirePermission } from '@/lib/route-guards'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { ProductFormDialog } from '@/components/products/ProductFormDialog'
import { createProductsConfig, type ProductRow } from '@/entities/products.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useProducts } from '@/hooks/queries/use-products'
import { useCurrentCompany } from '@/hooks/queries/use-companies'
import { useDeleteProduct } from '@/hooks/mutations/use-delete-product'
import { useAbility } from '@/hooks/use-ability'
import { canAny } from '@/lib/ability'

export const Route = createFileRoute('/_authed/products')({
  beforeLoad: (opts) => requirePermission(opts, 'products'),
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: ProductsPage,
})

function ProductsPage() {
  const company = useCurrentCompany()
  const { data: rows = [], isLoading } = useProducts()
  const config = createProductsConfig(company?.code ?? '')
  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<ProductRow | null>(null)
  const deleteProduct = useDeleteProduct()
  const ability = useAbility()
  const canManage = canAny(ability, ['products.manage'])

  return (
    <>
      <EntityTableView
        config={config}
        rows={rows}
        isLoading={isLoading}
        canCreate={canManage}
        onCreate={() => {
          setEditingRow(null)
          setFormOpen(true)
        }}
        onEditRow={
          canManage
            ? (row) => {
                setEditingRow(row)
                setFormOpen(true)
              }
            : undefined
        }
        onDeleteRow={canManage ? (row) => deleteProduct.mutate(row.id) : undefined}
      />
      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editingRow} />
    </>
  )
}
