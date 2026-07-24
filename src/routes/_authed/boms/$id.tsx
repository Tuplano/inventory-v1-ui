import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { requirePermission } from '@/lib/route-guards'
import { ChevronDown, Factory, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ToneBadge } from '@/components/entity-table/cells'
import { BomComponentsTable } from '@/components/boms/BomComponentsTable'
import { BomFormDialog } from '@/components/boms/BomFormDialog'
import { ProduceBomModal } from '@/components/boms/ProduceBomModal'
import { useBom } from '@/hooks/queries/use-bom'
import { useDeleteBom } from '@/hooks/mutations/use-delete-bom'
import { confirm } from '@/lib/confirm'
import { useAbility } from '@/hooks/use-ability'
import { canAny } from '@/lib/ability'

export const Route = createFileRoute('/_authed/boms/$id')({
  beforeLoad: (opts) => requirePermission(opts, 'boms'),
  component: BomDetailPage,
})

function BomDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { data: bom, isLoading } = useBom(id)
  const deleteBom = useDeleteBom()
  const [editOpen, setEditOpen] = useState(false)
  const [produceOpen, setProduceOpen] = useState(false)
  const ability = useAbility()
  const canManage = canAny(ability, ['bom.manage'])
  const canProduce = canAny(ability, ['bom.produce'])

  if (isLoading) return null
  if (!bom) {
    return <div className="p-6 text-[13px] text-[var(--text-3)]">BOM not found.</div>
  }

  async function handleDelete() {
    if (!bom) return
    const ok = await confirm({
      title: 'Delete this BOM?',
      description: 'This action cannot be undone.',
      confirmLabel: 'Delete BOM',
      variant: 'destructive',
    })
    if (ok) deleteBom.mutate(bom.id, { onSuccess: () => navigate({ to: '/boms' }) })
  }

  return (
    <div className="p-6">
      <button
        type="button"
        onClick={() => navigate({ to: '/boms' })}
        className="mb-3 flex items-center gap-1.5 text-xs text-[var(--text-3)] hover:text-[var(--text-2)]"
      >
        <ChevronDown className="size-3.5 rotate-90" />
        Bills of materials
      </button>

      <div className="mb-4.5 flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2.5">
            <div className="text-[20px] font-bold tracking-tight">{bom.name || bom.productName}</div>
            <ToneBadge tone={bom.isActive ? 'green' : 'neutral'} label={bom.isActive ? 'Active' : 'Inactive'} dot />
          </div>
          <div className="mt-1 text-[12.5px] text-[var(--text-3)]">
            {bom.productSku} — {bom.productName} · v{bom.version} · {bom.components.length} component(s)
          </div>
        </div>
        <div className="flex gap-2">
          {canProduce && bom.isActive && (
            <Button onClick={() => setProduceOpen(true)}>
              <Factory data-icon="inline-start" />
              Produce
            </Button>
          )}
          {canManage && (
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil data-icon="inline-start" />
              Edit
            </Button>
          )}
          {canManage && (
            <Button variant="outline" className="text-[var(--red)]" onClick={handleDelete} disabled={deleteBom.isPending}>
              Delete
            </Button>
          )}
        </div>
      </div>

      <BomComponentsTable components={bom.components} />

      {canManage && <BomFormDialog open={editOpen} onOpenChange={setEditOpen} bom={bom} />}
      {canProduce && <ProduceBomModal open={produceOpen} onOpenChange={setProduceOpen} bom={bom} />}
    </div>
  )
}
