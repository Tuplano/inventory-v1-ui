import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateCompany } from '@/hooks/mutations/use-create-company'
import { useUpdateCompany } from '@/hooks/mutations/use-update-company'
import { useCompanies } from '@/hooks/queries/use-companies'
import type { CompanyRow } from '@/entities/companies.config'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  legalName: z.string(),
  email: z.string().email('Email must be valid').or(z.literal('')),
  phone: z.string(),
  website: z.string().url('Website must be a valid URL').or(z.literal('')),
  taxId: z.string(),
})

type FormValues = z.infer<typeof formSchema>

const emptyValues: FormValues = { name: '', code: '', legalName: '', email: '', phone: '', website: '', taxId: '' }

export function CompanyFormDialog({
  open,
  onOpenChange,
  company,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  company?: CompanyRow | null
}) {
  const isEdit = !!company
  const { data: companies = [] } = useCompanies()
  const createCompany = useCreateCompany()
  const updateCompany = useUpdateCompany()
  const pending = createCompany.isPending || updateCompany.isPending

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!open) return
    const record = company ? companies.find((c) => c.id === company.id) : undefined
    reset(
      record
        ? {
            name: record.name,
            code: record.code,
            legalName: record.legalName ?? '',
            email: record.email ?? '',
            phone: record.phone ?? '',
            website: record.website ?? '',
            taxId: record.taxId ?? '',
          }
        : emptyValues,
    )
  }, [open, company, companies, reset])

  function onSubmit(values: FormValues) {
    const payload = {
      name: values.name,
      code: values.code,
      legalName: values.legalName || undefined,
      email: values.email || undefined,
      phone: values.phone || undefined,
      website: values.website || undefined,
      taxId: values.taxId || undefined,
    }
    const onSuccess = () => onOpenChange(false)
    if (isEdit) {
      updateCompany.mutate({ id: company.id, input: payload }, { onSuccess })
    } else {
      createCompany.mutate(payload, { onSuccess })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit company' : 'New company'}</DialogTitle>
          </DialogHeader>

          <div className="flex max-h-[65vh] flex-col gap-3.5 overflow-y-auto py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="co-name" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Name
                </Label>
                <Input id="co-name" {...register('name')} />
                {errors.name && <p className="mt-1 text-xs text-[var(--red)]">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="co-code" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Code
                </Label>
                <Input id="co-code" className="font-mono" {...register('code')} />
                {errors.code && <p className="mt-1 text-xs text-[var(--red)]">{errors.code.message}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="co-legal" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                Legal name
              </Label>
              <Input id="co-legal" {...register('legalName')} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="co-email" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Email
                </Label>
                <Input id="co-email" type="email" {...register('email')} />
                {errors.email && <p className="mt-1 text-xs text-[var(--red)]">{errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="co-phone" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Phone
                </Label>
                <Input id="co-phone" {...register('phone')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="co-website" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Website
                </Label>
                <Input id="co-website" {...register('website')} />
                {errors.website && <p className="mt-1 text-xs text-[var(--red)]">{errors.website.message}</p>}
              </div>
              <div>
                <Label htmlFor="co-tax" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Tax ID
                </Label>
                <Input id="co-tax" className="font-mono" {...register('taxId')} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {isEdit ? 'Save changes' : 'Create company'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
