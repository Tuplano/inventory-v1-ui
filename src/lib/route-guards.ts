import { redirect } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { useScopeStore } from '@/stores/scope-store'
import { myPermissionsQueryOptions } from '@/hooks/queries/use-my-permissions'
import { getNavItemPermissions } from '@/components/app-shell/nav-config'
import { buildAbilityFromPermissions, canAny } from '@/lib/ability'

/**
 * Route-level defense in depth: mirrors the permission check the API already enforces
 * so a page can't be reached directly by URL when the sidebar merely hides its link.
 * Redirects to /forbidden instead of rendering a page with no data.
 */
export async function requirePermission(
  { context }: { context: { queryClient: QueryClient } },
  routeKey: string,
) {
  const permissions = getNavItemPermissions(routeKey)
  if (!permissions?.length) return

  const { companyId } = useScopeStore.getState()
  if (!companyId) return

  const granted = await context.queryClient.ensureQueryData(myPermissionsQueryOptions(companyId))
  const ability = buildAbilityFromPermissions(granted)

  if (!canAny(ability, permissions)) {
    throw redirect({ to: '/forbidden' })
  }
}
