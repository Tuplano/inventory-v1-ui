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
import { useCreateLocation } from '@/hooks/mutations/use-create-location'
import { useUpdateLocation } from '@/hooks/mutations/use-update-location'
import type { ProductLocationRecord } from '@/entities/locations.config'
import type { LocationType } from '@/entities/types'

const locationTypes: LocationType[] = ['GENERAL', 'RECEIVING', 'STAGING', 'STORAGE', 'DISPATCH']

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  type: z.enum(['GENERAL', 'RECEIVING', 'STAGING', 'STORAGE', 'DISPATCH']),
  aisle: z.string(),
  bay: z.string(),
  level: z.string(),
  bin: z.string(),
  capacity: z.string(),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

const emptyValues: FormValues = {
  name: '',
  code: '',
  type: 'GENERAL',
  aisle: '',
  bay: '',
  level: '',
  bin: '',
  capacity: '',
  isActive: true,
}

export function LocationFormDialog({
  open,
  onOpenChange,
  location,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  location?: ProductLocationRecord | null
}) {
  const isEdit = !!location
  const createLocation = useCreateLocation()
  const updateLocation = useUpdateLocation()
  const pending = createLocation.isPending || updateLocation.isPending

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
      location
        ? {
            name: location.name,
            code: location.code,
            type: location.type,
            aisle: location.aisle ?? '',
            bay: location.bay ?? '',
            level: location.level ?? '',
            bin: location.bin ?? '',
            capacity: location.capacity != null ? String(location.capacity) : '',
            isActive: location.isActive,
          }
        : emptyValues,
    )
  }, [open, location, reset])

  function onSubmit(values: FormValues) {
    const onSuccess = () => onOpenChange(false)
    const capacity = values.capacity ? Number(values.capacity) : undefined
    if (isEdit) {
      updateLocation.mutate(
        {
          id: location.id,
          input: {
            name: values.name,
            type: values.type,
            aisle: values.aisle || null,
            bay: values.bay || null,
            level: values.level || null,
            bin: values.bin || null,
            capacity: capacity ?? null,
            isActive: values.isActive,
          },
        },
        { onSuccess },
      )
    } else {
      createLocation.mutate(
        {
          name: values.name,
          code: values.code,
          type: values.type,
          aisle: values.aisle || undefined,
          bay: values.bay || undefined,
          level: values.level || undefined,
          bin: values.bin || undefined,
          capacity,
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
            <DialogTitle>{isEdit ? 'Edit location' : 'New location'}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3.5 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="loc-name" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Name
                </Label>
                <Input id="loc-name" {...register('name')} />
                {errors.name && <p className="mt-1 text-xs text-[var(--red)]">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="loc-code" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Code
                </Label>
                <Input id="loc-code" className="font-mono" disabled={isEdit} {...register('code')} />
                {errors.code && <p className="mt-1 text-xs text-[var(--red)]">{errors.code.message}</p>}
              </div>
            </div>

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
                      {locationTypes.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div>
                <Label htmlFor="loc-aisle" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Aisle
                </Label>
                <Input id="loc-aisle" className="font-mono" {...register('aisle')} />
              </div>
              <div>
                <Label htmlFor="loc-bay" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Bay
                </Label>
                <Input id="loc-bay" className="font-mono" {...register('bay')} />
              </div>
              <div>
                <Label htmlFor="loc-level" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Level
                </Label>
                <Input id="loc-level" className="font-mono" {...register('level')} />
              </div>
              <div>
                <Label htmlFor="loc-bin" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Bin
                </Label>
                <Input id="loc-bin" className="font-mono" {...register('bin')} />
              </div>
            </div>

            <div>
              <Label htmlFor="loc-capacity" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                Capacity <span className="font-normal text-[var(--text-3)]">(optional)</span>
              </Label>
              <Input id="loc-capacity" type="number" min="0" step="any" className="font-mono" {...register('capacity')} />
            </div>

            {isEdit && (
              <div className="flex items-center justify-between">
                <Label htmlFor="loc-active" className="text-[11.5px] font-semibold text-[var(--text-2)]">
                  Active
                </Label>
                <Controller
                  control={control}
                  name="isActive"
                  render={({ field }) => <Switch id="loc-active" checked={field.value} onCheckedChange={field.onChange} />}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {isEdit ? 'Save changes' : 'Create location'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
