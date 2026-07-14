import { useQuery } from '@tanstack/react-query'
import { mockStore } from '@/mock'

export function useConversions() {
  return useQuery({
    queryKey: ['conversions'],
    queryFn: () => mockStore.listConversions(),
  })
}
