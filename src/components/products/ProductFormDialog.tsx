import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateProduct } from '@/hooks/mutations/use-create-product'
import { useUpdateProduct } from '@/hooks/mutations/use-update-product'
import { useCategories } from '@/hooks/queries/use-categories'
import { useUoms } from '@/hooks/queries/use-uoms'
import { trackingTypes, type ProductRow } from '@/entities/products.config'

const NONE = '__none__'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string(),
  brand: z.string(),
  description: z.string(),
  categoryId: z.string(),
  baseUomId: z.string().min(1, 'Base unit is required'),
  purchaseUomId: z.string(),
  saleUomId: z.string(),
  trackingType: z.enum(trackingTypes),
  costPrice: z.string(),
  sellingPrice: z.string(),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

const emptyValues: FormValues = {
  name: '',
  sku: '',
  barcode: '',
  brand: '',
  description: '',
  categoryId: NONE,
  baseUomId: '',
  purchaseUomId: NONE,
  saleUomId: NONE,
  trackingType: 'NONE',
  costPrice: '',
  sellingPrice: '',
  isActive: true,
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: ProductRow | null
}) {
  const isEdit = !!product
  const { data: categories = [] } = useCategories()
  const { data: uoms = [] } = useUoms()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const pending = createProduct.isPending || updateProduct.isPending

  const categoryItems = { [NONE]: 'None', ...Object.fromEntries(categories.map((c) => [c.id, c.name])) }
  const uomItems = Object.fromEntries(uoms.map((u) => [u.id, u.abbreviation]))
  const optionalUomItems = { [NONE]: 'None', ...uomItems }

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
      product
        ? {
            name: product.name,
            sku: product.sku,
            barcode: product.barcode ?? '',
            brand: product.brand ?? '',
            description: product.description ?? '',
            categoryId: product.categoryId ?? NONE,
            baseUomId: product.baseUomId,
            purchaseUomId: product.purchaseUomId ?? NONE,
            saleUomId: product.saleUomId ?? NONE,
            trackingType: product.trackingType,
            costPrice: product.costPrice ?? '',
            sellingPrice: product.sellingPrice ?? '',
            isActive: product.isActive,
          }
        : emptyValues,
    )
  }, [open, product, reset])

  function onSubmit(values: FormValues) {
    const shared = {
      name: values.name,
      sku: values.sku,
      barcode: values.barcode || undefined,
      brand: values.brand || undefined,
      description: values.description || undefined,
      categoryId: values.categoryId === NONE ? undefined : values.categoryId,
      baseUomId: values.baseUomId,
      purchaseUomId: values.purchaseUomId === NONE ? undefined : values.purchaseUomId,
      saleUomId: values.saleUomId === NONE ? undefined : values.saleUomId,
      trackingType: values.trackingType,
      costPrice: values.costPrice === '' ? undefined : Number(values.costPrice),
      sellingPrice: values.sellingPrice === '' ? undefined : Number(values.sellingPrice),
    }
    const onSuccess = () => onOpenChange(false)
    if (isEdit) {
      updateProduct.mutate({ id: product.id, input: { ...shared, isActive: values.isActive } }, { onSuccess })
    } else {
      createProduct.mutate(shared, { onSuccess })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit product' : 'New product'}</DialogTitle>
          </DialogHeader>

          <div className="flex max-h-[65vh] flex-col gap-3.5 overflow-y-auto py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="prod-name" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Name
                </Label>
                <Input id="prod-name" {...register('name')} />
                {errors.name && <p className="mt-1 text-xs text-[var(--red)]">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="prod-sku" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  SKU
                </Label>
                <Input id="prod-sku" className="font-mono" {...register('sku')} />
                {errors.sku && <p className="mt-1 text-xs text-[var(--red)]">{errors.sku.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="prod-barcode" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Barcode
                </Label>
                <Input id="prod-barcode" className="font-mono" {...register('barcode')} />
              </div>
              <div>
                <Label htmlFor="prod-brand" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Brand
                </Label>
                <Input id="prod-brand" {...register('brand')} />
              </div>
            </div>

            <div>
              <Label htmlFor="prod-description" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                Description
              </Label>
              <Textarea id="prod-description" {...register('description')} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="prod-cost" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Cost price
                </Label>
                <Input id="prod-cost" type="number" step="any" min="0" className="font-mono" {...register('costPrice')} />
              </div>
              <div>
                <Label htmlFor="prod-sell" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Selling price
                </Label>
                <Input id="prod-sell" type="number" step="any" min="0" className="font-mono" {...register('sellingPrice')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">Category</Label>
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} items={categoryItems}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>None</SelectItem>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">Tracking</Label>
                <Controller
                  control={control}
                  name="trackingType"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {trackingTypes.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">Base UOM</Label>
                <Controller
                  control={control}
                  name="baseUomId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} items={uomItems}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select" />
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
                {errors.baseUomId && <p className="mt-1 text-xs text-[var(--red)]">{errors.baseUomId.message}</p>}
              </div>
              <div>
                <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">Purchase UOM</Label>
                <Controller
                  control={control}
                  name="purchaseUomId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} items={optionalUomItems}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>None</SelectItem>
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
                <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">Sale UOM</Label>
                <Controller
                  control={control}
                  name="saleUomId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} items={optionalUomItems}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>None</SelectItem>
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
            </div>

            {isEdit && (
              <div className="flex items-center justify-between">
                <Label htmlFor="prod-active" className="text-[11.5px] font-semibold text-[var(--text-2)]">
                  Active
                </Label>
                <Controller
                  control={control}
                  name="isActive"
                  render={({ field }) => <Switch id="prod-active" checked={field.value} onCheckedChange={field.onChange} />}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {isEdit ? 'Save changes' : 'Create product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
