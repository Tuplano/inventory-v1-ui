import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'
import type { PermissionCatalogRecord, PermissionRow } from '@/entities/permissions.config'

interface RoleWithPermissions {
  name: string
  permissions: { code: string }[]
}

export function usePermissions() {
  const { companyId } = useScopeStore()
  return useQuery({
    queryKey: ['permissions', companyId],
    queryFn: async (): Promise<PermissionRow[]> => {
      const [{ data: catalog }, roles] = await Promise.all([
        apiClient.get<PermissionCatalogRecord[]>('/permissions'),
        apiClient
          .get<RoleWithPermissions[]>('/roles')
          .then((res) => res.data)
          .catch(() => [] as RoleWithPermissions[]),
      ])

      return catalog.map((p) => ({
        ...p,
        grantedToRoles: roles.filter((r) => r.permissions.some((rp) => rp.code === p.code)).map((r) => r.name),
      }))
    },
    enabled: !!companyId,
  })
}
