import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { requirePermission } from '@/lib/route-guards'
import { EntityTableView } from '@/components/entity-table/EntityTableView'
import { CategoryFormDialog } from '@/components/categories/CategoryFormDialog'
import { createCategoriesConfig, type CategoryRecord } from '@/entities/categories.config'
import { entityTableSearchSchema } from '@/entities/types'
import { useAbility } from '@/hooks/use-ability'
import { canAny } from '@/lib/ability'
import { useCategories } from '@/hooks/queries/use-categories'
import { useCurrentBranch } from '@/hooks/queries/use-branches'
import { useDeleteCategory } from '@/hooks/mutations/use-delete-category'

export const Route = createFileRoute('/_authed/categories')({
  beforeLoad: (opts) => requirePermission(opts, 'categories'),
  validateSearch: (search) => entityTableSearchSchema.parse(search),
  component: CategoriesPage,
})

function CategoriesPage() {
  const branch = useCurrentBranch()
  const { data: rows = [], isLoading } = useCategories()
  const config = createCategoriesConfig(branch?.name ?? '')
  const [formOpen, setFormOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<CategoryRecord | null>(null)
  const deleteCategory = useDeleteCategory()
  const ability = useAbility()
  const canManage = canAny(ability, ['categories.manage'])

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
        onDeleteRow={canManage ? (row) => deleteCategory.mutate(row.id) : undefined}
      />
      <CategoryFormDialog open={formOpen} onOpenChange={setFormOpen} category={editingRow} />
    </>
  )
}
