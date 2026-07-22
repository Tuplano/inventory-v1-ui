import { LoginForm } from './LoginForm'

export function LoginCard() {
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

        <LoginForm />
      </div>
    </div>
  )
}
