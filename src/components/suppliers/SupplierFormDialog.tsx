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
import { useCreateSupplier } from '@/hooks/mutations/use-create-supplier'
import { useUpdateSupplier } from '@/hooks/mutations/use-update-supplier'
import type { SupplierRecord } from '@/entities/suppliers.config'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  contactName: z.string(),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  phone: z.string(),
  address: z.string(),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

const emptyValues: FormValues = { name: '', code: '', contactName: '', email: '', phone: '', address: '', isActive: true }

export function SupplierFormDialog({
  open,
  onOpenChange,
  supplier,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier?: SupplierRecord | null
}) {
  const isEdit = !!supplier
  const createSupplier = useCreateSupplier()
  const updateSupplier = useUpdateSupplier()
  const pending = createSupplier.isPending || updateSupplier.isPending

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
      supplier
        ? {
            name: supplier.name,
            code: supplier.code,
            contactName: supplier.contactName ?? '',
            email: supplier.email ?? '',
            phone: supplier.phone ?? '',
            address: supplier.address ?? '',
            isActive: supplier.isActive,
          }
        : emptyValues,
    )
  }, [open, supplier, reset])

  function onSubmit(values: FormValues) {
    const payload = {
      name: values.name,
      code: values.code,
      contactName: values.contactName || undefined,
      email: values.email || undefined,
      phone: values.phone || undefined,
      address: values.address || undefined,
    }
    const onSuccess = () => onOpenChange(false)
    if (isEdit) {
      updateSupplier.mutate({ id: supplier.id, input: { ...payload, isActive: values.isActive } }, { onSuccess })
    } else {
      createSupplier.mutate(payload, { onSuccess })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit supplier' : 'New supplier'}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3.5 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="sup-name" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Name
                </Label>
                <Input id="sup-name" {...register('name')} />
                {errors.name && <p className="mt-1 text-xs text-[var(--red)]">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="sup-code" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Code
                </Label>
                <Input id="sup-code" className="font-mono" {...register('code')} />
                {errors.code && <p className="mt-1 text-xs text-[var(--red)]">{errors.code.message}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="sup-contact" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                Contact name
              </Label>
              <Input id="sup-contact" {...register('contactName')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="sup-email" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Email
                </Label>
                <Input id="sup-email" type="email" {...register('email')} />
                {errors.email && <p className="mt-1 text-xs text-[var(--red)]">{errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="sup-phone" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Phone
                </Label>
                <Input id="sup-phone" {...register('phone')} />
              </div>
            </div>
            <div>
              <Label htmlFor="sup-address" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                Address
              </Label>
              <Textarea id="sup-address" {...register('address')} />
            </div>
            {isEdit && (
              <div className="flex items-center justify-between">
                <Label htmlFor="sup-active" className="text-[11.5px] font-semibold text-[var(--text-2)]">
                  Active
                </Label>
                <Controller
                  control={control}
                  name="isActive"
                  render={({ field }) => <Switch id="sup-active" checked={field.value} onCheckedChange={field.onChange} />}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {isEdit ? 'Save changes' : 'Create supplier'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
