import { useQuery } from '@tanstack/react-query'
import { mockStore } from '@/mock'

export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: () => mockStore.listSuppliers(),
  })
}
