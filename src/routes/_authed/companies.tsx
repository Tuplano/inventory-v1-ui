import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { createCompaniesConfig } from '@/entities/companies.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useCompanyRows } from '@/hooks/queries/use-companies'

export const Route = createFileRoute('/_authed/companies')({
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: CompaniesPage,
})

function CompaniesPage() {
  const { data: rows = [], isLoading } = useCompanyRows()
  const config = createCompaniesConfig()

  return <EntityTableView config={config} rows={rows} isLoading={isLoading} />
}
