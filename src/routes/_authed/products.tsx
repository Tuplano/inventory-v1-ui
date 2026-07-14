import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { createProductsConfig } from '@/entities/products.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useProducts } from '@/hooks/queries/use-products'
import { useScopeStore } from '@/stores/scope-store'
import { mockStore } from '@/mock'

export const Route = createFileRoute('/_authed/products')({
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: ProductsPage,
})

function ProductsPage() {
  const companyId = useScopeStore((s) => s.companyId)
  const company = mockStore.getCompany(companyId)
  const { data: rows = [], isLoading } = useProducts()
  const config = createProductsConfig(company?.code ?? '')

  return <EntityTableView config={config} rows={rows} isLoading={isLoading} />
}
