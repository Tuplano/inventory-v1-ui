import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useConfirmStore } from '@/lib/confirm'

export function ConfirmDialog() {
  const options = useConfirmStore((s) => s.options)
  const resolve = useConfirmStore((s) => s.resolve)

  function settle(result: boolean) {
    resolve?.(result)
    useConfirmStore.setState({ options: null, resolve: null })
  }

  return (
    <AlertDialog open={!!options} onOpenChange={(open) => !open && settle(false)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{options?.title}</AlertDialogTitle>
          {options?.description && <AlertDialogDescription>{options.description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => settle(false)}>{options?.cancelLabel ?? 'Cancel'}</AlertDialogCancel>
          <AlertDialogAction variant={options?.variant ?? 'destructive'} onClick={() => settle(true)}>
            {options?.confirmLabel ?? 'Confirm'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
