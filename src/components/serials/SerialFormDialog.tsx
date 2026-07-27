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

const formSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  currentLocationId: z.string(),
})

type FormValues = z.infer<typeof formSchema>

const emptyValues: FormValues = { productId: '', serialNumber: '', currentLocationId: NONE }

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
  // Scoped to just this product+branch (rather than fetching every serial in the company) since
  // that's all the capacity check needs. Only IN_STOCK counts: a DEFECTIVE/ISSUED serial stays in
  // the table (not soft-deleted, for audit history) after its unit already left the recorded
  // on-hand quantity, so counting every status here would double-subtract it and could show more
  // "serialized" than actually recorded.
  const selectedProductId = watch('productId')
  const { data: existingSerials } = useSerials({ productId: selectedProductId || undefined, branchId, status: 'IN_STOCK', limit: 100 })
  const recordedQty = inventory.find((i) => i.productId === selectedProductId)?.quantity ?? 0
  const existingSerialCount = existingSerials?.rows.length ?? 0
  const remainingToSerialize = recordedQty - existingSerialCount
  const atCapacity = !isEdit && !!selectedProductId && remainingToSerialize <= 0

  useEffect(() => {
    if (!open) return
    reset(
      serial
        ? { productId: serial.productId, serialNumber: serial.serialNumber, currentLocationId: serial.currentLocationId ?? NONE }
        : emptyValues,
    )
  }, [open, serial, reset])

  function onSubmit(values: FormValues) {
    const onSuccess = () => onOpenChange(false)
    if (isEdit) {
      // Status/location aren't editable here — see updateSerialSchema for why (they only change
      // through Adjust/Transfer/Place/Assign, which keep stock quantities in sync).
      updateSerial.mutate({ id: serial.id, input: { serialNumber: values.serialNumber } }, { onSuccess })
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
              </>
            )}

            {isEdit && serial && (
              <>
                <div>
                  <Label htmlFor="serial-number-edit" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                    Serial number
                  </Label>
                  <Input id="serial-number-edit" className="font-mono" {...register('serialNumber')} />
                  {errors.serialNumber && <p className="mt-1 text-xs text-[var(--red)]">{errors.serialNumber.message}</p>}
                </div>
                {/* Status and location aren't editable here — they only change through a real stock
                    action (Adjust, Transfer, Place, Assign serials), which keeps quantities in
                    sync. Shown read-only so this isn't a dead end for "where is this unit". */}
                <div className="rounded-md border border-[var(--border-2)] px-3 py-2 text-[11.5px] text-[var(--text-3)]">
                  <div>
                    Status: <span className="font-medium text-[var(--text-2)]">{serial.status.replace('_', ' ')}</span>
                  </div>
                  <div>
                    Location:{' '}
                    <span className="font-medium text-[var(--text-2)]">
                      {locations.find((l) => l.id === serial.currentLocationId)?.name ?? 'None'}
                    </span>
                  </div>
                </div>
              </>
            )}
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
