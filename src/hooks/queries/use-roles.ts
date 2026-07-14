import { useQuery } from '@tanstack/react-query'
import { mockStore } from '@/mock'
import type { RoleRow } from '@/entities/roles.config'

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async (): Promise<RoleRow[]> => {
      const [roles, permissions] = await Promise.all([mockStore.listRoles(), mockStore.listPermissions()])
      return roles.map((r) => ({ ...r, totalPermissions: permissions.length, allPermissions: permissions }))
    },
  })
}
