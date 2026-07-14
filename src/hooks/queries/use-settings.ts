import { useQuery } from '@tanstack/react-query'
import { mockStore } from '@/mock'

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => mockStore.listSettings(),
  })
}
