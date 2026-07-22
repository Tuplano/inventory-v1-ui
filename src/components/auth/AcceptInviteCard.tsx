import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth-store'
import { useInviteDetails } from '@/hooks/queries/use-invite-details'

const schema = z.object({
  name: z.string().min(1, 'Full name is required'),
  password: z.string().min(8, 'At least 8 characters'),
})

type FormValues = z.infer<typeof schema>

export function AcceptInviteCard({ token }: { token: string }) {
  const { data: invite, isLoading, error: detailsError } = useInviteDetails(token)
  const acceptInvite = useAuthStore((s) => s.acceptInvite)
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', password: '' },
  })

  async function onSubmit(values: FormValues) {
    setFormError(null)
    try {
      await acceptInvite(token, values.name, values.password)
      navigate({ to: '/select-workspace' })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to accept this invite')
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center p-6"
      style={{
        background: 'radial-gradient(120% 120% at 50% 0%, var(--surface-3) 0%, var(--bg) 55%)',
      }}
    >
      <div className="w-[392px] rounded-xl border border-border bg-card p-8 shadow-[0_12px_40px_rgba(20,26,40,0.08)]">
        <div className="mb-1.5 flex items-center gap-2.5">
          <div className="flex size-[30px] items-center justify-center rounded-lg bg-primary text-[15px] font-bold text-primary-foreground">
            P
          </div>
          <div className="text-[16px] font-bold tracking-tight">Palletyx</div>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-[12.5px] text-[var(--text-3)]">Loading invite…</div>
        ) : detailsError || !invite ? (
          <div className="py-8 text-center text-[12.5px] text-[var(--red)]">
            {detailsError instanceof Error ? detailsError.message : 'This invite is invalid or has expired.'}
          </div>
        ) : (
          <>
            <div className="mb-5.5 text-[12.5px] text-[var(--text-3)]">
              You've been invited to join <strong className="text-foreground">{invite.companyName}</strong> as{' '}
              <strong className="text-foreground">{invite.roleName}</strong> ({invite.branchLabel})
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
              <div>
                <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">Email</Label>
                <Input value={invite.email} disabled className="font-mono" />
              </div>
              <div>
                <Label htmlFor="invite-name" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Full name
                </Label>
                <Input id="invite-name" {...register('name')} />
                {errors.name && <p className="mt-1 text-xs text-[var(--red)]">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="invite-password" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                  Password
                </Label>
                <Input id="invite-password" type="password" {...register('password')} />
                {errors.password && <p className="mt-1 text-xs text-[var(--red)]">{errors.password.message}</p>}
              </div>
              {formError && <p className="text-xs text-[var(--red)]">{formError}</p>}
              <Button type="submit" disabled={isSubmitting} className="mt-1.5 w-full">
                Accept invite &amp; sign in
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
