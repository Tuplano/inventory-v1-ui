import { useQuery } from '@tanstack/react-query'
import { mockStore } from '@/mock'

export function useBranches() {
  return useQuery({
    queryKey: ['branches'],
    queryFn: () => mockStore.listBranches(),
  })
}
