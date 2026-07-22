import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Copy, Mail, UserPlus } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { useRoles } from '@/hooks/queries/use-roles'
import { useBranches } from '@/hooks/queries/use-branches'
import { useCreateInvite, type CreateInviteResult } from '@/hooks/mutations/use-create-invite'
import { useSendInviteEmail } from '@/hooks/mutations/use-send-invite-email'

export function InviteUserModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: roles = [] } = useRoles()
  const { data: branches = [] } = useBranches()
  const createInvite = useCreateInvite()
  const sendInviteEmail = useSendInviteEmail()

  const activeRoles = roles.filter((r) => r.isActive)

  const [email, setEmail] = useState('')
  const [roleId, setRoleId] = useState('')
  const [hasAllBranches, setHasAllBranches] = useState(true)
  const [branchId, setBranchId] = useState('')
  const [result, setResult] = useState<CreateInviteResult | null>(null)

  useEffect(() => {
    if (!open) return
    setEmail('')
    setRoleId('')
    setHasAllBranches(true)
    setBranchId('')
    setResult(null)
  }, [open])

  const inviteLink = result ? `${window.location.origin}/invite/${result.token}` : ''

  function handleCreate() {
    if (!email.trim()) {
      toast.warning('Enter an email address')
      return
    }
    if (!roleId) {
      toast.warning('Select a role')
      return
    }
    if (!hasAllBranches && !branchId) {
      toast.warning('Select a branch, or grant access to all branches')
      return
    }

    createInvite.mutate(
      { email: email.trim(), roleId, hasAllBranches, branchId: hasAllBranches ? undefined : branchId },
      { onSuccess: (data) => setResult(data) },
    )
  }

  function handleCopy() {
    navigator.clipboard.writeText(inviteLink)
    toast.success('Invite link copied')
  }

  function handleSendEmail() {
    if (!result) return
    sendInviteEmail.mutate({ inviteId: result.invite.id, token: result.token })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Invite user</DialogTitle>
        </DialogHeader>

        {!result ? (
          <div className="flex flex-col gap-3.5 py-2">
            <div>
              <Label htmlFor="invite-email" className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">
                Email
              </Label>
              <Input id="invite-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div>
              <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">Role</Label>
              <NativeSelect className="w-full" value={roleId} onChange={(e) => setRoleId(e.target.value)}>
                <NativeSelectOption value="">Select a role</NativeSelectOption>
                {activeRoles.map((r) => (
                  <NativeSelectOption key={r.id} value={r.id}>
                    {r.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="invite-all-branches" className="text-[11.5px] font-semibold text-[var(--text-2)]">
                Access to all branches
              </Label>
              <Switch id="invite-all-branches" checked={hasAllBranches} onCheckedChange={setHasAllBranches} />
            </div>

            {!hasAllBranches && (
              <div>
                <Label className="mb-1.5 block text-[11.5px] font-semibold text-[var(--text-2)]">Branch</Label>
                <NativeSelect className="w-full" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
                  <NativeSelectOption value="">Select a branch</NativeSelectOption>
                  {branches.map((b) => (
                    <NativeSelectOption key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3 py-2">
            <div className="text-[12.5px] text-[var(--text-2)]">
              Invite created for <span className="font-semibold">{result.invite.email}</span>. Share the link below, or
              send it by email.
            </div>
            <div className="flex items-center gap-2 rounded-md border border-[var(--border-2)] bg-[var(--surface-2)] px-3 py-2">
              <span className="flex-1 truncate font-mono text-[11.5px] text-[var(--text-2)]">{inviteLink}</span>
              <button type="button" onClick={handleCopy} className="shrink-0 text-[var(--brand-accent)]">
                <Copy className="size-4" />
              </button>
            </div>
            {result.emailSent && <div className="text-[11px] font-semibold text-[var(--green)]">Email sent</div>}
            {result.emailError && (
              <div className="text-[11px] text-[var(--text-3)]">
                Couldn't email it automatically ({result.emailError}) — copy the link instead, or retry below.
              </div>
            )}
            <Button type="button" variant="outline" onClick={handleSendEmail} disabled={sendInviteEmail.isPending}>
              <Mail data-icon="inline-start" />
              Send email
            </Button>
          </div>
        )}

        <DialogFooter>
          {!result ? (
            <>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createInvite.isPending}>
                <UserPlus data-icon="inline-start" />
                Create invite
              </Button>
            </>
          ) : (
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
