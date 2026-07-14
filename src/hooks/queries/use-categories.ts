import { useQuery } from '@tanstack/react-query'
import { mockStore } from '@/mock'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => mockStore.listCategories(),
  })
}
