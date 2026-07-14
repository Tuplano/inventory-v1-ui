import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { ProductFormDialog } from '@/components/products/ProductFormDialog'
import { createProductsConfig, type ProductRow } from '@/entities/products.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useProducts } from '@/hooks/queries/use-products'
import { useCurrentCompany } from '@/hooks/queries/use-companies'

export const Route = createFileRoute('/_authed/products')({
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: ProductsPage,
})

function ProductsPage() {
  const company = useCurrentCompany()
  const { data: rows = [], isLoading } = useProducts()
  const config = createProductsConfig(company?.code ?? '')
  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<ProductRow | null>(null)

  return (
    <>
      <EntityTableView
        config={config}
        rows={rows}
        isLoading={isLoading}
        onCreate={() => {
          setEditingRow(null)
          setFormOpen(true)
        }}
        onEditRow={(row) => {
          setEditingRow(row)
          setFormOpen(true)
        }}
      />
      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editingRow} />
    </>
  )
}
