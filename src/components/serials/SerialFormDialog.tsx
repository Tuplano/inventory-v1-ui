import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateSerial } from '@/hooks/mutations/use-create-serial'
import { useUpdateSerial } from '@/hooks/mutations/use-update-serial'
import { useProducts } from '@/hooks/queries/use-products'
import { useLocations } from '@/hooks/queries/use-locations'
import { useSerials } from '@/hooks/queries/use-serials'
import { useInventory } from '@/hooks/queries/use-inventory'
import { useScopeStore } from '@/stores/scope-store'
import type { SerialRow } from '@/entities/serials.config'

const NONE = '__none__'
const serialStatuses = ['IN_STOCK', 'ISSUED', 'RETURNED', 'DAMAGED'] as const

const formSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  currentLocationId: z.string(),
  status: z.enum(serialStatuses),
})

type FormValues = z.infer<typeof formSchema>

const emptyValues: FormValues = { productId: '', serialNumber: '', currentLocationId: NONE, status: 'IN_STOCK' }

export function SerialFormDialog({
  open,
  onOpenChange,
  serial,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  serial?: SerialRow | null
}) {
  const isEdit = !!serial
  const { data: products = [] } = useProducts()
  const { data: locations = [] } = useLocations()
  const { data: serials = [] } = useSerials()
  const { data: inventory = [] } = useInventory()
  const branchId = useScopeStore((s) => s.branchId)
  const createSerial = useCreateSerial()
  const updateSerial = useUpdateSerial()
  const pending = createSerial.isPending || updateSerial.isPending

  const serialProducts = products.filter((p) => p.trackingType === 'SERIAL')

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

  // A serial is only meant to identify a unit that's already recorded in this branch's
  // quantity — cap manual creation at what's not yet serialized, same idea as "Assign serials".
  const selectedProductId = watch('productId')
  const recordedQty = inventory.find((i) => i.productId === selectedProductId)?.quantity ?? 0
  const existingSerialCount = serials.filter((s) => s.productId === selectedProductId && s.currentBranchId === branchId).length
  const remainingToSerialize = recordedQty - existingSerialCount
  const atCapacity = !isEdit && !!selectedProductId && remainingToSerialize <= 0

  useEffect(() => {
    if (!open) return
    reset(
      serial
        ? {
            productId: serial.productId,
            serialNumber: serial.serialNumber,
            currentLocationId: serial.currentLocationId ?? NONE,
            status: serial.status,
          }
        : emptyValues,
    )
  }, [open, serial, reset])

  function onSubmit(values: FormValues) {
    const onSuccess = () => onOpenChange(false)
    if (isEdit) {
      updateSerial.mutate(
        {
          id: serial.id,
          input: {
            status: values.status,
            currentLocationId: values.currentLocationId === NONE ? null : values.currentLocationId,
          },
        },
        { onSuccess },
      )
    } else {
      createSerial.mutate(
        {
          productId: values.productId,
          serialNumber: values.serialNumber,
          currentBranchId: branchId || undefined,
          currentLocationId: values.currentLocationId === NONE ? undefined : values.currentLocationId,
        },
        { onSuccess },
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit serial number' : 'New serial number'}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3.5 py-2">
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
                          {serialProducts.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.sku} — {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.productId && <p className="mt-1 text-xs text-[var(--red)]">{errors.productId.message}</p>}
                  {selectedProductId && (
                    <div
                      className="mt-1 text-[10.5px] font-semibold"
                      style={{ color: atCapacity ? 'var(--red)' : 'var(--text-3)' }}
                    >
                      {existingSerialCount} of {recordedQty.toLocaleString()} unit(s) serialized at this branch
                      {atCapacity && ' · fully serialized, increase quantity via a stock adjustment first'}
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="serial-number" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                    Serial number
                  </Label>
                  <Input id="serial-number" className="font-mono" disabled={atCapacity} {...register('serialNumber')} />
                  {errors.serialNumber && <p className="mt-1 text-xs text-[var(--red)]">{errors.serialNumber.message}</p>}
                </div>
              </>
            )}

            {isEdit && (
              <div>
                <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">Status</Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {serialStatuses.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}

            <div>
              <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">Location</Label>
              <Controller
                control={control}
                name="currentLocationId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>None</SelectItem>
                      {locations.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.code} — {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending || atCapacity}>
              {isEdit ? 'Save changes' : 'Create serial'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
