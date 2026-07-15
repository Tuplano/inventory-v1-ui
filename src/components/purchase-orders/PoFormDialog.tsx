import { useEffect } from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreatePo } from '@/hooks/mutations/use-create-po'
import { useSuppliers } from '@/hooks/queries/use-suppliers'
import { useProducts } from '@/hooks/queries/use-products'
import { useUoms } from '@/hooks/queries/use-uoms'

const lineSchema = z.object({
  productId: z.string().min(1, 'Required'),
  uomId: z.string().min(1, 'Required'),
  orderedQty: z.number().positive('Must be positive'),
  unitCost: z.number().min(0, 'Cannot be negative'),
})

const formSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  poNumber: z.string().min(1, 'PO number is required'),
  expectedDate: z.string(),
  notes: z.string(),
  lines: z.array(lineSchema).min(1, 'At least one line item is required'),
})

type FormValues = z.infer<typeof formSchema>

const emptyLine = { productId: '', uomId: '', orderedQty: 1, unitCost: 0 }
const emptyValues: FormValues = { supplierId: '', poNumber: '', expectedDate: '', notes: '', lines: [emptyLine] }

export function PoFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: suppliers = [] } = useSuppliers()
  const { data: products = [] } = useProducts()
  const { data: uoms = [] } = useUoms()
  const createPo = useCreatePo()

  const supplierItems = Object.fromEntries(suppliers.map((s) => [s.id, s.name]))
  const productItems = Object.fromEntries(products.map((p) => [p.id, `${p.sku} — ${p.name}`]))
  const uomItems = Object.fromEntries(uoms.map((u) => [u.id, u.abbreviation]))

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

  const { fields, append, remove } = useFieldArray({ control, name: 'lines' })

  useEffect(() => {
    if (open) reset(emptyValues)
  }, [open, reset])

  function onSubmit(values: FormValues) {
    createPo.mutate(
      {
        supplierId: values.supplierId,
        poNumber: values.poNumber,
        expectedDate: values.expectedDate || undefined,
        notes: values.notes || undefined,
        lines: values.lines,
      },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-[720px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>New purchase order</DialogTitle>
          </DialogHeader>

          <div className="flex flex-1 flex-col gap-3.5 overflow-y-auto py-2">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">Supplier</Label>
                <Controller
                  control={control}
                  name="supplierId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} items={supplierItems}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.supplierId && <p className="mt-1 text-xs text-[var(--red)]">{errors.supplierId.message}</p>}
              </div>
              <div>
                <Label htmlFor="po-number" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  PO number
                </Label>
                <Input id="po-number" className="font-mono" {...register('poNumber')} />
                {errors.poNumber && <p className="mt-1 text-xs text-[var(--red)]">{errors.poNumber.message}</p>}
              </div>
              <div>
                <Label htmlFor="po-expected" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Expected date
                </Label>
                <Input id="po-expected" type="date" className="font-mono" {...register('expectedDate')} />
              </div>
            </div>

            <div>
              <Label htmlFor="po-notes" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                Notes
              </Label>
              <Textarea id="po-notes" {...register('notes')} />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label className="text-[11.5px] font-semibold text-[var(--text-2)]">Line items</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => append(emptyLine)}>
                  <Plus data-icon="inline-start" />
                  Add line
                </Button>
              </div>
              {errors.lines?.message && <p className="mb-1.5 text-xs text-[var(--red)]">{errors.lines.message}</p>}
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 px-2.5">
                <Label className="text-[10.5px] font-semibold text-[var(--text-3)]">Product</Label>
                <Label className="text-[10.5px] font-semibold text-[var(--text-3)]">UoM</Label>
                <Label className="text-[10.5px] font-semibold text-[var(--text-3)]">Quantity</Label>
                <Label className="text-[10.5px] font-semibold text-[var(--text-3)]">Cost</Label>
                <div />
              </div>
              <div className="flex flex-col gap-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-start gap-2 rounded-md border border-border p-2.5">
                    <div>
                      <Controller
                        control={control}
                        name={`lines.${index}.productId`}
                        render={({ field: f }) => (
                          <Select value={f.value} onValueChange={f.onChange} items={productItems}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Product" />
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
                      {errors.lines?.[index]?.productId && (
                        <p className="mt-1 text-xs text-[var(--red)]">{errors.lines[index]?.productId?.message}</p>
                      )}
                    </div>
                    <div>
                      <Controller
                        control={control}
                        name={`lines.${index}.uomId`}
                        render={({ field: f }) => (
                          <Select value={f.value} onValueChange={f.onChange} items={uomItems}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="UoM" />
                            </SelectTrigger>
                            <SelectContent>
                              {uoms.map((u) => (
                                <SelectItem key={u.id} value={u.id}>
                                  {u.abbreviation}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        step="any"
                        placeholder="Qty"
                        className="font-mono"
                        {...register(`lines.${index}.orderedQty`, { valueAsNumber: true })}
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        step="any"
                        placeholder="Cost"
                        className="font-mono"
                        {...register(`lines.${index}.unitCost`, { valueAsNumber: true })}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={fields.length <= 1}
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createPo.isPending}>
              Create PO
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
