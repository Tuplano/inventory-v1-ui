import { useEffect } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useScopeStore } from '@/stores/scope-store'
import { useCompanies } from '@/hooks/queries/use-companies'
import { useBranches } from '@/hooks/queries/use-branches'
import { hashTone, toneColor } from '@/lib/tone'

export const Route = createFileRoute('/select-workspace')({
  beforeLoad: () => {
    if (typeof window !== 'undefined' && !useAuthStore.getState().authed) {
      throw redirect({ to: '/login' })
    }
  },
  component: SelectWorkspace,
})

function SelectWorkspace() {
  const navigate = useNavigate()
  const { data: companies, isLoading: companiesLoading } = useCompanies()
  const { data: branches, isLoading: branchesLoading } = useBranches()
  const { companyId, branchId, setCompany, setBranch } = useScopeStore()

  const company = companies?.find((c) => c.id === companyId)

  useEffect(() => {
    if (!companyId && companies && companies.length === 1) {
      setCompany(companies[0].id)
    }
  }, [companyId, companies, setCompany])

  useEffect(() => {
    if (companyId && !branchId && branches && branches.length === 1) {
      setBranch(branches[0].id)
    }
  }, [companyId, branchId, branches, setBranch])

  useEffect(() => {
    if (companyId && branchId) {
      navigate({ to: '/dashboard' })
    }
  }, [companyId, branchId, navigate])

  return (
    <div
      className="flex min-h-screen items-center justify-center p-6"
      style={{
        background: 'radial-gradient(120% 120% at 50% 0%, var(--surface-3) 0%, var(--bg) 55%)',
      }}
    >
      <div className="w-[420px] rounded-xl border border-border bg-card p-8 shadow-[0_12px_40px_rgba(20,26,40,0.08)]">
        <div className="mb-1.5 flex items-center gap-2.5">
          <div className="flex size-[30px] items-center justify-center rounded-lg bg-primary text-[15px] font-bold text-primary-foreground">
            P
          </div>
          <div className="text-[16px] font-bold tracking-tight">Palletyx</div>
        </div>
        <div className="mb-5.5 text-[12.5px] text-[var(--text-3)]">
          {!companyId ? 'Select a company to continue' : `Select a branch in ${company?.name ?? ''}`}
        </div>

        {companiesLoading ? (
          <div className="py-6 text-center text-[12.5px] text-[var(--text-3)]">Loading companies…</div>
        ) : !companies || companies.length === 0 ? (
          <div className="py-6 text-center text-[12.5px] text-[var(--text-3)]">
            Your account doesn&apos;t have access to any company yet. Contact an administrator.
          </div>
        ) : !companyId ? (
          <div className="flex flex-col gap-1.5">
            {companies.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCompany(c.id)}
                className="flex w-full items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-left hover:border-[var(--text-3)] hover:bg-[var(--surface-3)]"
              >
                <div
                  className="flex size-8 flex-none items-center justify-center rounded-md font-mono text-[11px] font-bold text-white"
                  style={{ background: toneColor(hashTone(c.code)) }}
                >
                  {c.code.slice(0, 3)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold">{c.name}</div>
                  <div className="font-mono text-[11px] text-[var(--text-3)]">{c.code}</div>
                </div>
                <ChevronRight className="size-4 flex-none text-[var(--text-3)]" />
              </button>
            ))}
          </div>
        ) : (
          <div>
            <button
              type="button"
              onClick={() => setCompany('')}
              className="mb-3 text-[11.5px] font-medium text-[var(--text-3)] hover:text-foreground hover:underline"
            >
              ← Change company
            </button>
            {branchesLoading ? (
              <div className="py-6 text-center text-[12.5px] text-[var(--text-3)]">Loading branches…</div>
            ) : !branches || branches.length === 0 ? (
              <div className="py-6 text-center text-[12.5px] text-[var(--text-3)]">
                This company has no branches yet. Contact an administrator.
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {branches.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBranch(b.id)}
                    className="flex w-full items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-left hover:border-[var(--text-3)] hover:bg-[var(--surface-3)]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-semibold">{b.name}</div>
                      <div className="font-mono text-[11px] text-[var(--text-3)]">{b.code}</div>
                    </div>
                    <ChevronRight className="size-4 flex-none text-[var(--text-3)]" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
