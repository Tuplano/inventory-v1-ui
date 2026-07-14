import { useQuery } from '@tanstack/react-query'
import { mockStore } from '@/mock'
import type { PermissionRow } from '@/entities/permissions.config'

export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async (): Promise<PermissionRow[]> => {
      const [permissions, roles] = await Promise.all([mockStore.listPermissions(), mockStore.listRoles()])
      const sampleRoles = roles.slice(0, 3)
      return permissions.map((p) => ({ ...p, sampleRoles }))
    },
  })
}
