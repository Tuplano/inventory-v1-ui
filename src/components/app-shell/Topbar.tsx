import { useNavigate, useSearch } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { CompanyBranchSwitcher } from './CompanyBranchSwitcher'
import { UserMenu } from './UserMenu'
import ThemeToggle from '@/components/ThemeToggle'

export function Topbar() {
  const navigate = useNavigate()
  const search = useSearch({ strict: false }) as { q?: string }

  function onSearch(value: string) {
    navigate({
      to: '.',
      search: (prev: Record<string, unknown>) => ({ ...prev, q: value || undefined }),
      replace: true,
    })
  }

  return (
    <header className="relative z-30 flex h-[52px] flex-none items-center gap-3.5 border-b border-border bg-card px-4">
      <CompanyBranchSwitcher />

      <div className="relative max-w-[420px] flex-1">
        <Search className="absolute left-2.5 top-1/2 size-[15px] -translate-y-1/2 text-[var(--text-3)]" />
        <input
          value={search.q ?? ''}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search this view…"
          className="w-full rounded-lg border border-border bg-[var(--surface-2)] py-1.5 pl-8 pr-2.5 text-[12.5px] outline-none focus-visible:border-ring"
        />
      </div>

      <div className="flex-1" />
      <div className="flex items-center gap-2 text-[11px] text-[var(--text-3)]">
        <span className="size-1.5 rounded-full bg-[var(--green)]" />
        API /api/v1 · session active
      </div>
      <ThemeToggle />
      <UserMenu />
    </header>
  )
}
