import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateBranch } from '@/hooks/mutations/use-create-branch'
import type { CompanyRow } from '@/entities/companies.config'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  address: z.string(),
})

type FormValues = z.infer<typeof formSchema>

const emptyValues: FormValues = { name: '', code: '', address: '' }

export function BranchFormDialog({
  open,
  onOpenChange,
  company,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  company: CompanyRow | null
}) {
  const createBranch = useCreateBranch()
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
    if (open) reset(emptyValues)
  }, [open, reset])

  function onSubmit(values: FormValues) {
    if (!company) return
    createBranch.mutate(
      { companyId: company.id, name: values.name, code: values.code, address: values.address || undefined },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>New branch{company ? ` in ${company.name}` : ''}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3.5 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="br-name" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Name
                </Label>
                <Input id="br-name" {...register('name')} />
                {errors.name && <p className="mt-1 text-xs text-[var(--red)]">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="br-code" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Code
                </Label>
                <Input id="br-code" className="font-mono" {...register('code')} />
                {errors.code && <p className="mt-1 text-xs text-[var(--red)]">{errors.code.message}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="br-address" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                Address
              </Label>
              <Input id="br-address" {...register('address')} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createBranch.isPending}>
              Create branch
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
