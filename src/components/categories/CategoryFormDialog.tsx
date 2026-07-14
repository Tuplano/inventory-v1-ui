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
import { useCreateCategory } from '@/hooks/mutations/use-create-category'
import { useUpdateCategory } from '@/hooks/mutations/use-update-category'
import type { CategoryRecord } from '@/entities/categories.config'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  description: z.string(),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

const emptyValues: FormValues = { name: '', code: '', description: '', isActive: true }

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: CategoryRecord | null
}) {
  const isEdit = !!category
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const pending = createCategory.isPending || updateCategory.isPending

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
      category
        ? { name: category.name, code: category.code, description: category.description ?? '', isActive: category.isActive }
        : emptyValues,
    )
  }, [open, category, reset])

  function onSubmit(values: FormValues) {
    const payload = { name: values.name, code: values.code, description: values.description || undefined }
    const onSuccess = () => onOpenChange(false)
    if (isEdit) {
      updateCategory.mutate({ id: category.id, input: { ...payload, isActive: values.isActive } }, { onSuccess })
    } else {
      createCategory.mutate(payload, { onSuccess })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit category' : 'New category'}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3.5 py-2">
            <div>
              <Label htmlFor="cat-name" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                Name
              </Label>
              <Input id="cat-name" {...register('name')} />
              {errors.name && <p className="mt-1 text-xs text-[var(--red)]">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="cat-code" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                Code
              </Label>
              <Input id="cat-code" className="font-mono" {...register('code')} />
              {errors.code && <p className="mt-1 text-xs text-[var(--red)]">{errors.code.message}</p>}
            </div>
            <div>
              <Label htmlFor="cat-description" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                Description
              </Label>
              <Textarea id="cat-description" {...register('description')} />
            </div>
            {isEdit && (
              <div className="flex items-center justify-between">
                <Label htmlFor="cat-active" className="text-[11.5px] font-semibold text-[var(--text-2)]">
                  Active
                </Label>
                <Controller
                  control={control}
                  name="isActive"
                  render={({ field }) => <Switch id="cat-active" checked={field.value} onCheckedChange={field.onChange} />}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {isEdit ? 'Save changes' : 'Create category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
