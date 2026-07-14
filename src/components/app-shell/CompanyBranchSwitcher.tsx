import { ChevronDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useCompanies } from '@/hooks/queries/use-companies'
import { useBranches } from '@/hooks/queries/use-branches'
import { useScopeStore } from '@/stores/scope-store'
import { cn } from '@/lib/utils'

export function CompanyBranchSwitcher() {
  const { data: companies = [] } = useCompanies()
  const { data: branches = [] } = useBranches()
  const { companyId, branchId, setCompany, setBranch } = useScopeStore()

  const company = companies.find((c) => c.id === companyId)
  const branch = branches.find((b) => b.id === branchId)
  const companyBranches = branches.filter((b) => b.companyId === companyId)

  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-2.5 rounded-lg border border-border bg-[var(--surface-2)] px-2.5 py-1.5 hover:border-[var(--text-3)]">
        <div
          className="flex size-6 flex-none items-center justify-center rounded-md font-mono text-[11px] font-bold text-white"
          style={{ background: company?.color }}
        >
          {company?.code.slice(0, 3)}
        </div>
        <div className="text-left leading-[1.15]">
          <div className="max-w-[180px] truncate text-[12.5px] font-semibold">{company?.name}</div>
          <div className="flex items-center gap-1 text-[11px] text-[var(--text-3)]">
            <span className="size-[5px] rounded-full bg-[var(--green)]" />
            {branch?.name.split(' — ')[0] ?? branch?.name}
          </div>
        </div>
        <ChevronDown className="ml-0.5 size-[15px] text-[var(--text-3)]" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[340px] p-2">
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.05em] text-[var(--text-3)]">
              Company
            </div>
            {companies.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCompany(c.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-[var(--surface-3)]',
                  c.id === companyId && 'bg-[var(--brand-accent-weak)]',
                )}
              >
                <div
                  className="flex size-[22px] flex-none items-center justify-center rounded-[5px] font-mono text-[10px] font-bold text-white"
                  style={{ background: c.color }}
                >
                  {c.code.slice(0, 3)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold">{c.name}</div>
                  <div className="font-mono text-[10.5px] text-[var(--text-3)]">{c.code}</div>
                </div>
                {c.id === companyId && <span className="font-bold text-[var(--brand-accent)]">✓</span>}
              </button>
            ))}
          </div>
          <div className="w-px bg-[var(--border-2)]" />
          <div className="flex-1">
            <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.05em] text-[var(--text-3)]">
              Branch
            </div>
            {companyBranches.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setBranch(b.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-[var(--surface-3)]',
                  b.id === branchId && 'bg-[var(--brand-accent-weak)]',
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold">{b.name}</div>
                  <div className="font-mono text-[10.5px] text-[var(--text-3)]">{b.code}</div>
                </div>
                {b.id === branchId && <span className="font-bold text-[var(--brand-accent)]">✓</span>}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
