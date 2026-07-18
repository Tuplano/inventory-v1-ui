import { create } from 'zustand'

export type ConfirmOptions = {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'destructive'
}

type ConfirmState = {
  options: ConfirmOptions | null
  resolve: ((value: boolean) => void) | null
}

export const useConfirmStore = create<ConfirmState>(() => ({
  options: null,
  resolve: null,
}))

export function confirm(options: ConfirmOptions): Promise<boolean> {
  useConfirmStore.getState().resolve?.(false)
  return new Promise((resolve) => {
    useConfirmStore.setState({ options, resolve })
  })
}
