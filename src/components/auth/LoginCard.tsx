import { useState } from 'react'
import { cn } from '@/lib/utils'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

export function LoginCard() {
  const [tab, setTab] = useState<'signin' | 'register'>('signin')

  return (
    <div
      className="flex min-h-screen items-center justify-center p-6"
      style={{
        background:
          'radial-gradient(120% 120% at 50% 0%, var(--surface-3) 0%, var(--bg) 55%)',
      }}
    >
      <div className="w-[392px] rounded-xl border border-border bg-card p-8 shadow-[0_12px_40px_rgba(20,26,40,0.08)]">
        <div className="mb-1.5 flex items-center gap-2.5">
          <div className="flex size-[30px] items-center justify-center rounded-lg bg-primary text-[15px] font-bold text-primary-foreground">
            P
          </div>
          <div className="text-[16px] font-bold tracking-tight">Palletyx</div>
        </div>
        <div className="mb-5.5 text-[12.5px] text-[var(--text-3)]">Inventory &amp; warehouse operations</div>

        <div className="mb-4.5 flex gap-1 rounded-lg bg-[var(--surface-3)] p-[3px]">
          <button
            type="button"
            onClick={() => setTab('signin')}
            className={cn(
              'flex-1 rounded-md py-1.5 text-[12.5px] font-semibold transition-colors',
              tab === 'signin' ? 'bg-card text-foreground' : 'text-[var(--text-3)]',
            )}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={cn(
              'flex-1 rounded-md py-1.5 text-[12.5px] font-semibold transition-colors',
              tab === 'register' ? 'bg-card text-foreground' : 'text-[var(--text-3)]',
            )}
          >
            Register
          </button>
        </div>

        {tab === 'signin' ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  )
}
