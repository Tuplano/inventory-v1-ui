import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mockStore } from '@/mock'

interface ScopeState {
  companyId: string
  branchId: string
  setCompany: (companyId: string) => void
  setBranch: (branchId: string) => void
}

export const useScopeStore = create<ScopeState>()(
  persist(
    (set) => ({
      companyId: 'c1',
      branchId: 'b1',
      setCompany: (companyId) => {
        const firstBranch = mockStore.branchesOf(companyId)[0]
        set({ companyId, branchId: firstBranch?.id ?? '' })
      },
      setBranch: (branchId) => set({ branchId }),
    }),
    { name: 'palletyx-scope' },
  ),
)
