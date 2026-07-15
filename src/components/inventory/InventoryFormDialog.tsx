import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUpdateInventoryItem } from '@/hooks/mutations/use-update-inventory-item'
import type { InventoryRow } from '@/entities/inventory.config'

const formSchema = z.object({
  minStockLevel: z.string(),
  maxStockLevel: z.string(),
})

type FormValues = z.infer<typeof formSchema>

export function InventoryFormDialog({
  open,
  onOpenChange,
  item,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: InventoryRow | null
}) {
  const updateItem = useUpdateInventoryItem()

  const { register, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { minStockLevel: '', maxStockLevel: '' },
  })

  useEffect(() => {
    if (!open) return
    reset({
      minStockLevel: item?.minStockLevel != null ? String(item.minStockLevel) : '',
      maxStockLevel: item?.maxStockLevel != null ? String(item.maxStockLevel) : '',
    })
  }, [open, item, reset])

  function onSubmit(values: FormValues) {
    if (!item) return
    updateItem.mutate(
      {
        id: item.id,
        input: {
          minStockLevel: values.minStockLevel === '' ? null : Number(values.minStockLevel),
          maxStockLevel: values.maxStockLevel === '' ? null : Number(values.maxStockLevel),
        },
      },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{item?.name ?? 'Adjust stock levels'}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3.5 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="inv-min" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Min stock level
                </Label>
                <Input id="inv-min" type="number" step="any" className="font-mono" {...register('minStockLevel')} />
              </div>
              <div>
                <Label htmlFor="inv-max" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Max stock level
                </Label>
                <Input id="inv-max" type="number" step="any" className="font-mono" {...register('maxStockLevel')} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateItem.isPending}>
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
