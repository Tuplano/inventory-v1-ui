import { Link, createFileRoute } from '@tanstack/react-router'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_authed/forbidden')({
  component: ForbiddenPage,
})

function ForbiddenPage() {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <ShieldAlert className="size-10 text-[var(--text-3)]" strokeWidth={1.5} />
      <h1 className="text-lg font-semibold">You don't have access to this page</h1>
      <p className="max-w-sm text-sm text-[var(--text-3)]">
        Your role doesn't include the permissions needed to view this page. Ask an administrator if you think this is
        a mistake.
      </p>
      <Button render={<Link to="/dashboard" />}>Back to dashboard</Button>
    </div>
  )
}
