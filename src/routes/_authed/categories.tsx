import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { createCategoriesConfig } from '@/entities/categories.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useCategories } from '@/hooks/queries/use-categories'
import { useScopeStore } from '@/stores/scope-store'
import { mockStore } from '@/mock'

export const Route = createFileRoute('/_authed/categories')({
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: CategoriesPage,
})

function CategoriesPage() {
  const branchId = useScopeStore((s) => s.branchId)
  const branch = mockStore.getBranch(branchId)
  const { data: rows = [], isLoading } = useCategories()
  const config = createCategoriesConfig(branch?.name ?? '')

  return <EntityTableView config={config} rows={rows} isLoading={isLoading} />
}
