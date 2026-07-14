import { useNavigate } from '@tanstack/react-router'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAuthStore } from '@/stores/auth-store'
import { initials } from '@/lib/format'

export function UserMenu() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate({ to: '/login' })
  }

  return (
    <Popover>
      <PopoverTrigger className="flex size-[30px] items-center justify-center rounded-full bg-[var(--violet)] text-xs font-semibold text-white hover:opacity-90">
        {user ? initials(user.name) : 'U'}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[210px] p-2">
        <div className="mb-1.5 border-b border-[var(--border-2)] px-2 pb-2 pt-1">
          <div className="text-[12.5px] font-semibold">{user?.name}</div>
          <div className="text-[11px] text-[var(--text-3)]">{user?.email}</div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-md px-2 py-1.5 text-left text-[12.5px] text-[var(--red)] hover:bg-[var(--red-weak)]"
        >
          Log out
        </button>
      </PopoverContent>
    </Popover>
  )
}
