import { useQuery } from '@tanstack/react-query'
import { mockStore } from '@/mock'
import { useScopeStore } from '@/stores/scope-store'

export function useLocations() {
  const { branchId } = useScopeStore()
  return useQuery({
    queryKey: ['locations', branchId],
    queryFn: async () => {
      const locations = await mockStore.listLocations()
      return locations.filter((l) => l.branchId === branchId)
    },
  })
}
