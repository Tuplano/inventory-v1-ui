import { useMemo } from 'react'
import { useMyPermissions } from '@/hooks/queries/use-my-permissions'
import { buildAbilityFromPermissions } from '@/lib/ability'

/** The CASL ability for the current user, derived from their granted permission codes. */
export function useAbility() {
  const { data: grantedPermissions } = useMyPermissions()
  return useMemo(() => buildAbilityFromPermissions(grantedPermissions ?? []), [grantedPermissions])
}
