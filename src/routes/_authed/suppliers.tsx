import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { createSuppliersConfig } from '@/entities/suppliers.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useSuppliers } from '@/hooks/queries/use-suppliers'
import { useScopeStore } from '@/stores/scope-store'
import { mockStore } from '@/mock'

export const Route = createFileRoute('/_authed/suppliers')({
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: SuppliersPage,
})

function SuppliersPage() {
  const companyId = useScopeStore((s) => s.companyId)
  const company = mockStore.getCompany(companyId)
  const { data: rows = [], isLoading } = useSuppliers()
  const config = createSuppliersConfig(company?.code ?? '')

  return <EntityTableView config={config} rows={rows} isLoading={isLoading} />
}
