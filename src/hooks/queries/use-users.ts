import { useQuery } from '@tanstack/react-query'
import { mockStore } from '@/mock'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => mockStore.listUsers(),
  })
}
