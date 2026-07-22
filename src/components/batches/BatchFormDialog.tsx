import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateBatch } from '@/hooks/mutations/use-create-batch'
import { useUpdateBatch } from '@/hooks/mutations/use-update-batch'
import { useProducts } from '@/hooks/queries/use-products'
import { useSuppliers } from '@/hooks/queries/use-suppliers'
import type { BatchRow } from '@/entities/batches.config'

const NONE = '__none__'

const formSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  supplierId: z.string(),
  batchNumber: z.string().min(1, 'Batch number is required'),
  lotNumber: z.string(),
  manufacturingDate: z.string(),
  expiryDate: z.string(),
  initialQty: z.number().positive('Initial quantity must be positive'),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

const emptyValues: FormValues = {
  productId: '',
  supplierId: NONE,
  batchNumber: '',
  lotNumber: '',
  manufacturingDate: '',
  expiryDate: '',
  initialQty: 0,
  isActive: true,
}

export function BatchFormDialog({
  open,
  onOpenChange,
  batch,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  batch?: BatchRow | null
}) {
  const isEdit = !!batch
  const { data: products = [] } = useProducts()
  const { data: suppliers = [] } = useSuppliers()
  const createBatch = useCreateBatch()
  const updateBatch = useUpdateBatch()
  const pending = createBatch.isPending || updateBatch.isPending

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!open) return
    reset(
      batch
        ? {
            productId: batch.productId,
            supplierId: batch.supplierId ?? NONE,
            batchNumber: batch.batchNumber,
            lotNumber: batch.lotNumber ?? '',
            manufacturingDate: batch.manufacturingDate ? batch.manufacturingDate.slice(0, 10) : '',
            expiryDate: batch.expiryDate ? batch.expiryDate.slice(0, 10) : '',
            initialQty: batch.initialQty,
            isActive: batch.isActive,
          }
        : emptyValues,
    )
  }, [open, batch, reset])

  function onSubmit(values: FormValues) {
    const onSuccess = () => onOpenChange(false)
    if (isEdit) {
      updateBatch.mutate(
        {
          id: batch.id,
          input: {
            lotNumber: values.lotNumber || null,
            expiryDate: values.expiryDate || null,
            isActive: values.isActive,
          },
        },
        { onSuccess },
      )
    } else {
      createBatch.mutate(
        {
          productId: values.productId,
          supplierId: values.supplierId === NONE ? undefined : values.supplierId,
          batchNumber: values.batchNumber,
          lotNumber: values.lotNumber || undefined,
          manufacturingDate: values.manufacturingDate || undefined,
          expiryDate: values.expiryDate || undefined,
          initialQty: values.initialQty,
        },
        { onSuccess },
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit batch' : 'New batch'}</DialogTitle>
          </DialogHeader>

          <div className="flex max-h-[65vh] flex-col gap-3.5 overflow-y-auto py-2">
            {!isEdit && (
              <>
                <div>
                  <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">Product</Label>
                  <Controller
                    control={control}
                    name="productId"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.sku} — {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.productId && <p className="mt-1 text-xs text-[var(--red)]">{errors.productId.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="batch-number" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                      Batch number
                    </Label>
                    <Input id="batch-number" className="font-mono" {...register('batchNumber')} />
                    {errors.batchNumber && <p className="mt-1 text-xs text-[var(--red)]">{errors.batchNumber.message}</p>}
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">Supplier</Label>
                    <Controller
                      control={control}
                      name="supplierId"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NONE}>None</SelectItem>
                            {suppliers.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="batch-initial-qty" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                    Initial quantity
                  </Label>
                  <Input id="batch-initial-qty" type="number" step="any" className="font-mono" {...register('initialQty', { valueAsNumber: true })} />
                  {errors.initialQty && <p className="mt-1 text-xs text-[var(--red)]">{errors.initialQty.message}</p>}
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="batch-lot" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Lot number
                </Label>
                <Input id="batch-lot" className="font-mono" {...register('lotNumber')} />
              </div>
              <div>
                <Label htmlFor="batch-mfg" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Manufacturing date
                </Label>
                <Input id="batch-mfg" type="date" className="font-mono" disabled={isEdit} {...register('manufacturingDate')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="batch-expiry" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Expiry date
                </Label>
                <Input id="batch-expiry" type="date" className="font-mono" {...register('expiryDate')} />
              </div>
              {isEdit && batch && (
                <div>
                  <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">Remaining quantity</Label>
                  <div className="flex h-9 items-center rounded-md border border-[var(--border-2)] bg-[var(--surface-2)] px-3 font-mono text-[13px] text-[var(--text-2)]">
                    {batch.remainingQty.toLocaleString()}
                  </div>
                  <div className="mt-1 text-[10.5px] text-[var(--text-3)]">Use Adjust stock on a location to change this</div>
                </div>
              )}
            </div>

            {isEdit && (
              <div className="flex items-center justify-between">
                <Label htmlFor="batch-active" className="text-[11.5px] font-semibold text-[var(--text-2)]">
                  Active
                </Label>
                <Controller
                  control={control}
                  name="isActive"
                  render={({ field }) => <Switch id="batch-active" checked={field.value} onCheckedChange={field.onChange} />}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {isEdit ? 'Save changes' : 'Create batch'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
