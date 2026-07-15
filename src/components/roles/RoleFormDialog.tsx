import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { useCreateRole } from '@/hooks/mutations/use-create-role'
import { useUpdateRole } from '@/hooks/mutations/use-update-role'
import { useReplaceRolePermissions } from '@/hooks/mutations/use-replace-role-permissions'
import { usePermissions } from '@/hooks/queries/use-permissions'
import type { RoleRow } from '@/entities/roles.config'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  description: z.string(),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

const emptyValues: FormValues = { name: '', code: '', description: '', isActive: true }

export function RoleFormDialog({
  open,
  onOpenChange,
  role,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: RoleRow | null
}) {
  const isEdit = !!role
  const { data: catalog = [] } = usePermissions()
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const replacePermissions = useReplaceRolePermissions()
  const pending = createRole.isPending || updateRole.isPending || replacePermissions.isPending
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set())

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
      role
        ? { name: role.name, code: role.code, description: role.description ?? '', isActive: role.isActive }
        : emptyValues,
    )
    setSelectedCodes(new Set(role ? role.permissions.map((p) => p.code) : []))
  }, [open, role, reset])

  const grouped: Record<string, typeof catalog> = {}
  catalog.forEach((p) => {
    ;(grouped[p.module] ??= []).push(p)
  })

  function toggleCode(code: string) {
    setSelectedCodes((prev) => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }

  async function onSubmit(values: FormValues) {
    const codes = Array.from(selectedCodes)
    if (isEdit) {
      await updateRole.mutateAsync({
        id: role.id,
        input: { name: values.name, description: values.description || undefined, isActive: values.isActive },
      })
      if (codes.length > 0) {
        await replacePermissions.mutateAsync({ roleId: role.id, permissionCodes: codes })
      }
      onOpenChange(false)
    } else {
      const created = await createRole.mutateAsync({
        name: values.name,
        code: values.code,
        description: values.description || undefined,
      })
      if (codes.length > 0) {
        await replacePermissions.mutateAsync({ roleId: created.id, permissionCodes: codes })
      }
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit role' : 'New role'}</DialogTitle>
          </DialogHeader>

          <div className="flex max-h-[65vh] flex-col gap-3.5 overflow-y-auto py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="role-name" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Name
                </Label>
                <Input id="role-name" {...register('name')} />
                {errors.name && <p className="mt-1 text-xs text-[var(--red)]">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="role-code" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Code
                </Label>
                <Input id="role-code" className="font-mono" disabled={isEdit} {...register('code')} />
                {errors.code && <p className="mt-1 text-xs text-[var(--red)]">{errors.code.message}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="role-description" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                Description
              </Label>
              <Textarea id="role-description" {...register('description')} />
            </div>

            {isEdit && (
              <div className="flex items-center justify-between">
                <Label htmlFor="role-active" className="text-[11.5px] font-semibold text-[var(--text-2)]">
                  Active
                </Label>
                <Controller
                  control={control}
                  name="isActive"
                  render={({ field }) => <Switch id="role-active" checked={field.value} onCheckedChange={field.onChange} />}
                />
              </div>
            )}

            <div>
              <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                Permissions ({selectedCodes.size})
              </Label>
              <div className="flex max-h-[220px] flex-col gap-3 overflow-y-auto rounded-md border border-border p-3">
                {Object.entries(grouped).map(([module, perms]) => (
                  <div key={module}>
                    <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.03em] text-[var(--text-3)]">{module}</div>
                    <div className="flex flex-col gap-1.5">
                      {perms.map((p) => (
                        <label key={p.code} className="flex items-center gap-2 text-[12.5px]">
                          <Checkbox checked={selectedCodes.has(p.code)} onCheckedChange={() => toggleCode(p.code)} />
                          <span className="font-mono text-[11.5px] text-[var(--text-2)]">{p.code}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {isEdit ? 'Save changes' : 'Create role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
