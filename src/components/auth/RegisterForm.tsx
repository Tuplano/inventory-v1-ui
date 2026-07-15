import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth-store'

const schema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
})

type FormValues = z.infer<typeof schema>

export function RegisterForm() {
  const register_ = useAuthStore((s) => s.register)
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '' },
  })

  async function onSubmit(values: FormValues) {
    setFormError(null)
    try {
      await register_(values.name, values.email, values.password)
      navigate({ to: '/select-workspace' })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to create account')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
      <div>
        <Label htmlFor="name" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
          Full name
        </Label>
        <Input id="name" {...register('name')} />
        {errors.name && <p className="mt-1 text-xs text-[var(--red)]">{errors.name.message}</p>}
      </div>
      <div>
        <Label htmlFor="reg-email" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
          Email
        </Label>
        <Input id="reg-email" type="email" {...register('email')} />
        {errors.email && <p className="mt-1 text-xs text-[var(--red)]">{errors.email.message}</p>}
      </div>
      <div>
        <Label htmlFor="reg-password" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
          Password
        </Label>
        <Input id="reg-password" type="password" {...register('password')} />
        {errors.password && <p className="mt-1 text-xs text-[var(--red)]">{errors.password.message}</p>}
      </div>
      {formError && <p className="text-xs text-[var(--red)]">{formError}</p>}
      <Button type="submit" disabled={isSubmitting} className="mt-1.5 w-full">
        Create account
      </Button>
      <p className="mt-1 text-center text-[11px] text-[var(--text-3)]">
        Session secured with httpOnly cookies · CSRF double-submit
      </p>
    </form>
  )
}
