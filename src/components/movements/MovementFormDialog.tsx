import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateMovement } from '@/hooks/mutations/use-create-movement'
import { useProducts } from '@/hooks/queries/use-products'
import { creatableMovementTypes } from '@/entities/movements.config'

const formSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  type: z.enum(creatableMovementTypes),
  quantity: z.number().positive('Quantity must be greater than zero'),
  reference: z.string(),
  remarks: z.string(),
})

type FormValues = z.infer<typeof formSchema>

const emptyValues: FormValues = { productId: '', type: 'RECEIVING', quantity: 1, reference: '', remarks: '' }

export function MovementFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: products = [] } = useProducts()
  const createMovement = useCreateMovement()

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
    if (open) reset(emptyValues)
  }, [open, reset])

  function onSubmit(values: FormValues) {
    createMovement.mutate(
      {
        productId: values.productId,
        type: values.type,
        quantity: values.quantity,
        reference: values.reference || undefined,
        remarks: values.remarks || undefined,
      },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>New movement</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3.5 py-2">
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
                <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">Type</Label>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {creatableMovementTypes.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label htmlFor="mv-qty" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Quantity
                </Label>
                <Input id="mv-qty" type="number" step="any" className="font-mono" {...register('quantity', { valueAsNumber: true })} />
                {errors.quantity && <p className="mt-1 text-xs text-[var(--red)]">{errors.quantity.message}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="mv-reference" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                Reference
              </Label>
              <Input id="mv-reference" className="font-mono" {...register('reference')} />
            </div>

            <div>
              <Label htmlFor="mv-remarks" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                Remarks
              </Label>
              <Textarea id="mv-remarks" {...register('remarks')} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMovement.isPending}>
              Record movement
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
