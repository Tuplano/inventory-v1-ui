import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUpdateUser } from '@/hooks/mutations/use-update-user'
import type { UserRecord } from '@/entities/users.config'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

type FormValues = z.infer<typeof formSchema>

export function UserFormDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserRecord | null
}) {
  const updateUser = useUpdateUser()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '' },
  })

  useEffect(() => {
    if (!open) return
    reset({ name: user?.name ?? '' })
  }, [open, user, reset])

  function onSubmit(values: FormValues) {
    if (!user) return
    updateUser.mutate({ id: user.id, input: { name: values.name } }, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3.5 py-2">
            <div>
              <Label htmlFor="user-email" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                Email
              </Label>
              <Input id="user-email" value={user?.email ?? ''} disabled />
            </div>
            <div>
              <Label htmlFor="user-name" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                Name
              </Label>
              <Input id="user-name" {...register('name')} />
              {errors.name && <p className="mt-1 text-xs text-[var(--red)]">{errors.name.message}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateUser.isPending}>
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
