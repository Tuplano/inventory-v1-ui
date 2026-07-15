import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ScopeState {
  companyId: string
  branchId: string
  setCompany: (companyId: string) => void
  setBranch: (branchId: string) => void
  resetScope: () => void
}

export const useScopeStore = create<ScopeState>()(
  persist(
    (set) => ({
      companyId: '',
      branchId: '',
      setCompany: (companyId) => set({ companyId, branchId: '' }),
      setBranch: (branchId) => set({ branchId }),
      resetScope: () => set({ companyId: '', branchId: '' }),
    }),
    { name: 'palletyx-scope' },
  ),
)
