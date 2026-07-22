import { Link } from '@tanstack/react-router'
import { PanelLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/stores/ui-store'
import { useLowStockCount } from '@/hooks/queries/use-inventory'
import { useMyPermissions } from '@/hooks/queries/use-my-permissions'
import { navGroups, type NavItem } from './nav-config'

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)
  const lowStockCount = useLowStockCount()
  const { data: grantedPermissions } = useMyPermissions()

  const canSee = (item: NavItem) =>
    !item.permissions || item.permissions.some((p) => grantedPermissions?.has(p))

  const visibleGroups = navGroups
    .map((group) => ({ ...group, items: group.items.filter(canSee) }))
    .filter((group) => group.items.length > 0)

  return (
    <aside
      className={cn(
        'flex flex-none flex-col border-r border-border bg-card transition-[width] duration-150 ease-out',
        collapsed ? 'w-[60px]' : 'w-[228px]',
      )}
    >
      <div className="flex h-[52px] flex-none items-center gap-2.5 border-b border-[var(--border-2)] px-3.5">
        <div className="flex size-[26px] flex-none items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
          P
        </div>
        {!collapsed && <div className="whitespace-nowrap text-[14.5px] font-bold tracking-tight">Palletyx</div>}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4 pt-2">
        {visibleGroups.map((group, i) => (
          <div key={group.label} className={cn('mt-2.5', collapsed && i > 0 && 'border-t border-[var(--border-2)] pt-2.5')}>
            {!collapsed && (
              <div className="px-2 pb-1 pt-1.5 text-[10px] font-bold tracking-[0.07em] text-[var(--text-3)] uppercase">
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon
              const badgeCount = item.badge === 'lowStock' ? lowStockCount : 0
              return (
                <Link
                  key={item.route}
                  to={item.to}
                  title={item.label}
                  className="mb-0.5 flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium text-[var(--text-2)] hover:bg-[var(--surface-3)] [&.active-nav]:bg-[var(--brand-accent-weak)] [&.active-nav]:font-semibold [&.active-nav]:text-[var(--brand-accent-d)]"
                  activeOptions={{ exact: false }}
                  activeProps={{ className: 'active-nav' }}
                >
                  <Icon className="size-[17px] flex-none" strokeWidth={1.8} />
                  {!collapsed && <span className="flex-1 whitespace-nowrap">{item.label}</span>}
                  {!collapsed && badgeCount > 0 && (
                    <span className="rounded-full bg-[var(--red-weak)] px-1.5 py-px font-mono text-[10px] font-bold text-[var(--red)]">
                      {badgeCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="flex-none border-t border-[var(--border-2)] p-2">
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs text-[var(--text-3)] hover:bg-[var(--surface-3)] hover:text-[var(--text-2)]"
        >
          <PanelLeft className="size-[17px] flex-none" strokeWidth={1.8} />
          {!collapsed && <span className="whitespace-nowrap">Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
