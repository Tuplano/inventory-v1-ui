import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useScopeStore } from '@/stores/scope-store'
import type { RoleRecord, RoleRow } from '@/entities/roles.config'

interface RoleAssignmentRecord {
  id: string
  userId: string
  companyId: string
  roleId: string
}

interface PermissionCatalogEntry {
  code: string
}

export function useRoles() {
  const { companyId } = useScopeStore()
  return useQuery({
    queryKey: ['roles', companyId],
    queryFn: async (): Promise<RoleRow[]> => {
      const [{ data: roles }, assignments, catalog] = await Promise.all([
        apiClient.get<RoleRecord[]>('/roles'),
        apiClient
          .get<RoleAssignmentRecord[]>('/roles/assignments')
          .then((res) => res.data)
          .catch(() => [] as RoleAssignmentRecord[]),
        apiClient
          .get<PermissionCatalogEntry[]>('/permissions')
          .then((res) => res.data)
          .catch(() => [] as PermissionCatalogEntry[]),
      ])

      const userCountByRole = new Map<string, number>()
      assignments.forEach((a) => {
        userCountByRole.set(a.roleId, (userCountByRole.get(a.roleId) ?? 0) + 1)
      })

      return roles.map((r) => ({
        ...r,
        totalPermissionCount: catalog.length,
        userCount: userCountByRole.get(r.id) ?? 0,
      }))
    },
    enabled: !!companyId,
  })
}
