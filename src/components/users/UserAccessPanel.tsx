import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { useAbility } from '@/hooks/use-ability'
import { canAny } from '@/lib/ability'
import { confirm } from '@/lib/confirm'
import { useAuthStore } from '@/stores/auth-store'
import { useBranches } from '@/hooks/queries/use-branches'
import { useBranchAccessList, useCompanyAccessList } from '@/hooks/queries/use-tenant-access'
import { useGrantBranchAccess } from '@/hooks/mutations/use-grant-branch-access'
import { useGrantCompanyAccess } from '@/hooks/mutations/use-grant-company-access'
import { useRevokeBranchAccess } from '@/hooks/mutations/use-revoke-branch-access'
import { useRevokeCompanyAccess } from '@/hooks/mutations/use-revoke-company-access'
import type { UserRecord } from '@/entities/users.config'

export function UserAccessPanel({ row }: { row: UserRecord }) {
  const ability = useAbility()
  const canView = canAny(ability, ['company-access.view'])
  const canManage = canAny(ability, ['company-access.manage'])
  const isSelf = useAuthStore((s) => s.user?.id) === row.id
  const [grantAllBranches, setGrantAllBranches] = useState(true)

  const { data: companyAccess, isLoading: companyLoading } = useCompanyAccessList(canView)
  const { data: branchAccess, isLoading: branchLoading } = useBranchAccessList(canView)
  const { data: branches } = useBranches()
  const grantCompanyAccess = useGrantCompanyAccess()
  const grantBranchAccess = useGrantBranchAccess()
  const revokeCompanyAccess = useRevokeCompanyAccess()
  const revokeBranchAccess = useRevokeBranchAccess()

  if (!canView) return null

  const grant = companyAccess?.find((g) => g.userId === row.id && g.isActive)
  const branchGrants = (branchAccess ?? []).filter((g) => g.userId === row.id && g.isActive)

  async function handleRevokeCompany() {
    if (!grant) return
    const ok = await confirm({
      title: `Remove ${row.name} from this company?`,
      description: 'This revokes their access to this company and every one of its branches.',
    })
    if (ok) revokeCompanyAccess.mutate(grant.id)
  }

  async function handleRevokeBranch(accessId: string, branchName: string) {
    const ok = await confirm({
      title: `Remove access to ${branchName}?`,
      description: `${row.name} will no longer be able to select this branch.`,
    })
    if (ok) revokeBranchAccess.mutate(accessId)
  }

  function handleToggleBranch(branchId: string, branchName: string, nextChecked: boolean) {
    if (nextChecked) {
      grantBranchAccess.mutate({ userId: row.id, branchId })
      return
    }

    const existing = branchGrants.find((g) => g.branchId === branchId)
    if (existing) void handleRevokeBranch(existing.id, branchName)
  }

  return (
    <div className="mb-5">
      <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--text-3)]">
        Company &amp; branch access
      </div>

      {(companyLoading || branchLoading) && <div className="py-2 text-xs text-[var(--text-3)]">Loading…</div>}

      {isSelf && grant && (
        <div className="py-2 text-xs text-[var(--text-3)]">This is your own account — access can&apos;t be changed here.</div>
      )}

      {!companyLoading && !grant && (
        <div className="py-2">
          <div className="mb-2 text-xs text-[var(--text-3)]">No access to this company yet.</div>
          {canManage && !isSelf && (
            <>
              <label className="mb-2 flex items-center justify-between gap-3 text-[12.5px]">
                <span>Grant access to all branches</span>
                <Switch checked={grantAllBranches} onCheckedChange={setGrantAllBranches} />
              </label>
              <Button
                size="sm"
                onClick={() => grantCompanyAccess.mutate({ userId: row.id, hasAllBranches: grantAllBranches })}
                disabled={grantCompanyAccess.isPending}
              >
                Grant access
              </Button>
            </>
          )}
        </div>
      )}

      {grant && (
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border-2)] py-1.5">
          <div>
            <div className="text-xs font-medium">{grant.hasAllBranches ? 'All branches' : 'Selected branches only'}</div>
            <div className="text-[10.5px] text-[var(--text-3)]">Company-wide access grant</div>
          </div>
          {canManage && !isSelf && (
            <Button
              variant="outline"
              size="sm"
              className="text-[var(--red)]"
              onClick={handleRevokeCompany}
              disabled={revokeCompanyAccess.isPending}
            >
              <Trash2 data-icon="inline-start" />
              Remove
            </Button>
          )}
        </div>
      )}

      {grant && !grant.hasAllBranches && !branchLoading && (
        <div className="mt-1.5">
          <div className="mb-1 text-[10.5px] text-[var(--text-3)]">Branches they can access:</div>
          {(branches ?? []).length === 0 && <div className="py-2 text-xs text-[var(--text-3)]">No branches in this company yet.</div>}
          {(branches ?? []).map((branch) => {
            const branchGrant = branchGrants.find((g) => g.branchId === branch.id)
            const checked = !!branchGrant
            return (
              <label
                key={branch.id}
                className="flex items-center gap-2 border-b border-[var(--border-2)] py-1.5 text-xs text-[var(--text-2)]"
              >
                <Checkbox
                  checked={checked}
                  disabled={!canManage || isSelf || grantBranchAccess.isPending || revokeBranchAccess.isPending}
                  onCheckedChange={(checked) => handleToggleBranch(branch.id, branch.name, checked)}
                />
                {branch.name}
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}
