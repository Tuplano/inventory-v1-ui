import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/stores/auth-store'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

export function LoginForm() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: 'd.reyes@meridianhealth.co', password: '••••••••••' },
  })

  function onSubmit(values: FormValues) {
    login(values.email, values.password)
    navigate({ to: '/dashboard' })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5">
      <div>
        <Label htmlFor="email" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
          Email
        </Label>
        <Input id="email" type="email" {...register('email')} />
        {errors.email && <p className="mt-1 text-xs text-[var(--red)]">{errors.email.message}</p>}
      </div>
      <div>
        <Label htmlFor="password" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
          Password
        </Label>
        <Input id="password" type="password" {...register('password')} />
        {errors.password && <p className="mt-1 text-xs text-[var(--red)]">{errors.password.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting} className="mt-1.5 w-full">
        Sign in
      </Button>
      <p className="mt-1 text-center text-[11px] text-[var(--text-3)]">
        Session secured with httpOnly cookies · CSRF double-submit
      </p>
    </form>
  )
}
