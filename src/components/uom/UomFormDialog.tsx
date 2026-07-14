import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateUom } from '@/hooks/mutations/use-create-uom'
import { useUpdateUom } from '@/hooks/mutations/use-update-uom'
import { useCreateConversion } from '@/hooks/mutations/use-create-conversion'
import { useDeleteConversion } from '@/hooks/mutations/use-delete-conversion'
import { useUom } from '@/hooks/queries/use-uom'
import { useUoms } from '@/hooks/queries/use-uoms'
import { uomTypes, type UomRecord } from '@/entities/uom.config'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  abbreviation: z.string().min(1, 'Abbreviation is required').max(10, 'Max 10 characters'),
  type: z.enum(uomTypes),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

const emptyValues: FormValues = { name: '', abbreviation: '', type: 'PIECE', isActive: true }

export function UomFormDialog({
  open,
  onOpenChange,
  uom,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  uom?: UomRecord | null
}) {
  const isEdit = !!uom
  const createUom = useCreateUom()
  const updateUom = useUpdateUom()
  const pending = createUom.isPending || updateUom.isPending

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
    reset(uom ? { name: uom.name, abbreviation: uom.abbreviation, type: uom.type, isActive: uom.isActive } : emptyValues)
  }, [open, uom, reset])

  function onSubmit(values: FormValues) {
    const onSuccess = () => (isEdit ? undefined : onOpenChange(false))
    if (isEdit) {
      updateUom.mutate({ id: uom.id, input: { name: values.name, isActive: values.isActive } }, { onSuccess })
    } else {
      createUom.mutate({ name: values.name, abbreviation: values.abbreviation, type: values.type }, { onSuccess: () => onOpenChange(false) })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit unit' : 'New unit'}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3.5 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="uom-name" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Name
                </Label>
                <Input id="uom-name" {...register('name')} />
                {errors.name && <p className="mt-1 text-xs text-[var(--red)]">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="uom-abbr" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Abbreviation
                </Label>
                <Input id="uom-abbr" className="font-mono" disabled={isEdit} {...register('abbreviation')} />
                {errors.abbreviation && <p className="mt-1 text-xs text-[var(--red)]">{errors.abbreviation.message}</p>}
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">Type</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={isEdit}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {uomTypes.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {isEdit && (
              <div className="flex items-center justify-between">
                <Label htmlFor="uom-active" className="text-[11.5px] font-semibold text-[var(--text-2)]">
                  Active
                </Label>
                <Controller
                  control={control}
                  name="isActive"
                  render={({ field }) => <Switch id="uom-active" checked={field.value} onCheckedChange={field.onChange} />}
                />
              </div>
            )}

            {isEdit && <ConversionsSection uom={uom} />}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {isEdit ? 'Close' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={pending}>
              {isEdit ? 'Save changes' : 'Create unit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ConversionsSection({ uom }: { uom: UomRecord }) {
  const { data: detail } = useUom(uom.id)
  const { data: allUoms = [] } = useUoms()
  const createConversion = useCreateConversion()
  const deleteConversion = useDeleteConversion()
  const [toUomId, setToUomId] = useState('')
  const [factor, setFactor] = useState('')

  const conversions = detail?.fromConversions ?? []
  const otherUoms = allUoms.filter((u) => u.id !== uom.id)

  function handleAdd() {
    const parsed = Number(factor)
    if (!toUomId || !parsed || parsed <= 0) return
    createConversion.mutate(
      { uomId: uom.id, input: { toUomId, conversionFactor: parsed } },
      { onSuccess: () => { setToUomId(''); setFactor('') } },
    )
  }

  return (
    <div className="border-t border-[var(--border-2)] pt-3">
      <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">Conversions</Label>
      <div className="mb-2 flex flex-col gap-1">
        {conversions.length === 0 && <p className="text-xs text-[var(--text-3)]">No conversions defined.</p>}
        {conversions.map((c) => {
          const target = allUoms.find((u) => u.id === c.toUomId)
          return (
            <div key={c.id} className="flex items-center justify-between rounded-md bg-[var(--surface-2)] px-2 py-1.5 text-xs">
              <span>
                1 {uom.abbreviation} = {c.conversionFactor} {target?.abbreviation ?? c.toUomId}
              </span>
              <button
                type="button"
                onClick={() => deleteConversion.mutate({ uomId: uom.id, conversionId: c.id })}
                className="text-[var(--text-3)] hover:text-[var(--red)]"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          )
        })}
      </div>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Select value={toUomId} onValueChange={(value) => setToUomId(value ?? '')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="To unit" />
            </SelectTrigger>
            <SelectContent>
              {otherUoms.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.abbreviation} — {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Input
          value={factor}
          onChange={(e) => setFactor(e.target.value.replace(/[^0-9.]/g, ''))}
          placeholder="Factor"
          inputMode="decimal"
          className="w-24"
        />
        <Button type="button" size="sm" onClick={handleAdd} disabled={createConversion.isPending}>
          Add
        </Button>
      </div>
    </div>
  )
}
