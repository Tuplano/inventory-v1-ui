import { useEffect } from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useCreateBom } from '@/hooks/mutations/use-create-bom'
import { useUpdateBom } from '@/hooks/mutations/use-update-bom'
import { useProducts } from '@/hooks/queries/use-products'
import type { BomDetail } from '@/hooks/queries/use-bom'

const lineSchema = z.object({
  componentProductId: z.string().min(1, 'Required'),
  quantity: z.number().positive('Must be positive'),
})

const formSchema = z.object({
  productId: z.string().min(1, 'Finished good is required'),
  name: z.string(),
  isActive: z.boolean(),
  components: z.array(lineSchema).min(1, 'At least one component is required'),
})

type FormValues = z.infer<typeof formSchema>

const emptyLine = { componentProductId: '', quantity: 1 }
const emptyValues: FormValues = { productId: '', name: '', isActive: true, components: [emptyLine] }

export function BomFormDialog({
  open,
  onOpenChange,
  bom,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  bom?: BomDetail | null
}) {
  const isEdit = !!bom
  const { data: products = [] } = useProducts()
  const createBom = useCreateBom()
  const updateBom = useUpdateBom()
  const pending = createBom.isPending || updateBom.isPending

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyValues,
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'components' })
  const selectedProductId = watch('productId')

  useEffect(() => {
    if (!open) return
    reset(
      bom
        ? {
            productId: bom.productId,
            name: bom.name ?? '',
            isActive: bom.isActive,
            components: bom.components.map((c) => ({ componentProductId: c.componentProductId, quantity: c.quantity })),
          }
        : emptyValues,
    )
  }, [open, bom, reset])

  function onSubmit(values: FormValues) {
    const onSuccess = () => onOpenChange(false)
    if (isEdit && bom) {
      updateBom.mutate(
        {
          id: bom.id,
          input: {
            name: values.name || undefined,
            isActive: values.isActive,
            components: values.components,
          },
        },
        { onSuccess },
      )
    } else {
      createBom.mutate(
        {
          productId: values.productId,
          name: values.name || undefined,
          components: values.components,
        },
        { onSuccess },
      )
    }
  }

  const componentProducts = products.filter((p) => p.id !== selectedProductId)
  const productItems = Object.fromEntries(products.map((p) => [p.id, `${p.sku} — ${p.name}`]))
  const componentProductItems = Object.fromEntries(componentProducts.map((p) => [p.id, `${p.sku} — ${p.name}`]))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-[680px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit BOM' : 'New BOM'}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-1 flex-col gap-3.5 overflow-y-auto py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">Finished good</Label>
                {isEdit ? (
                  <Input disabled value={`${bom?.productSku} — ${bom?.productName}`} className="font-mono" />
                ) : (
                  <Controller
                    control={control}
                    name="productId"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange} items={productItems}>
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
                )}
                {errors.productId && <p className="mt-1 text-xs text-[var(--red)]">{errors.productId.message}</p>}
              </div>
              <div>
                <Label htmlFor="bom-name" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Recipe name
                </Label>
                <Input id="bom-name" {...register('name')} placeholder="Optional" />
              </div>
            </div>

            {isEdit && (
              <div className="flex items-center justify-between">
                <Label htmlFor="bom-active" className="text-[11.5px] font-semibold text-[var(--text-2)]">
                  Active
                </Label>
                <Controller
                  control={control}
                  name="isActive"
                  render={({ field }) => <Switch id="bom-active" checked={field.value} onCheckedChange={field.onChange} />}
                />
              </div>
            )}

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label className="text-[11.5px] font-semibold text-[var(--text-2)]">Components</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => append(emptyLine)}>
                  <Plus data-icon="inline-start" />
                  Add component
                </Button>
              </div>
              {errors.components?.message && <p className="mb-1.5 text-xs text-[var(--red)]">{errors.components.message}</p>}
              <div className="grid grid-cols-[2fr_1fr_auto] gap-2 px-2.5">
                <Label className="text-[10.5px] font-semibold text-[var(--text-3)]">Component product</Label>
                <Label className="text-[10.5px] font-semibold text-[var(--text-3)]">Qty per unit</Label>
                <div />
              </div>
              <div className="flex flex-col gap-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-[2fr_1fr_auto] items-start gap-2 rounded-md border border-border p-2.5">
                    <div>
                      <Controller
                        control={control}
                        name={`components.${index}.componentProductId`}
                        render={({ field: f }) => (
                          <Select value={f.value} onValueChange={f.onChange} items={componentProductItems}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Product" />
                            </SelectTrigger>
                            <SelectContent>
                              {componentProducts.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.sku} — {p.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.components?.[index]?.componentProductId && (
                        <p className="mt-1 text-xs text-[var(--red)]">{errors.components[index]?.componentProductId?.message}</p>
                      )}
                    </div>
                    <div>
                      <Input
                        type="number"
                        step="any"
                        placeholder="Qty"
                        className="font-mono"
                        {...register(`components.${index}.quantity`, { valueAsNumber: true })}
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
            <Button type="submit" disabled={pending}>
              {isEdit ? 'Save changes' : 'Create BOM'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
