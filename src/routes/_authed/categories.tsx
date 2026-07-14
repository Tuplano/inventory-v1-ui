import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { CategoryFormDialog } from '@/components/categories/CategoryFormDialog'
import { createCategoriesConfig, type CategoryRecord } from '@/entities/categories.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useCategories } from '@/hooks/queries/use-categories'
import { useCurrentBranch } from '@/hooks/queries/use-branches'

export const Route = createFileRoute('/_authed/categories')({
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: CategoriesPage,
})

function CategoriesPage() {
  const branch = useCurrentBranch()
  const { data: rows = [], isLoading } = useCategories()
  const config = createCategoriesConfig(branch?.name ?? '')
  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<CategoryRecord | null>(null)

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
      <CategoryFormDialog open={formOpen} onOpenChange={setFormOpen} category={editingRow} />
    </>
  )
}
