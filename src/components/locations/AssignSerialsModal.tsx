import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Fingerprint } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useAssignSerials } from '@/hooks/mutations/use-assign-serials'

/** Splits a serials textarea's raw text into trimmed, non-blank entries (one per line or comma). */
function parseSerials(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function AssignSerialsModal({
  open,
  onOpenChange,
  productId,
  productName,
  locationId,
  locationLabel,
  availableQty,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string
  productName: string
  /** Where the anonymous quantity currently sits — null for floating (unplaced) stock. */
  locationId: string | null
  locationLabel: string
  availableQty: number
}) {
  const assignSerials = useAssignSerials()
  const [raw, setRaw] = useState('')

  useEffect(() => {
    if (!open) return
    setRaw('')
  }, [open])

  const serials = parseSerials(raw)
  const count = serials.length
  const hasDuplicates = new Set(serials).size !== serials.length
  const overAvailable = count > availableQty

  function handleSubmit() {
    if (count === 0) {
      toast.warning('Enter at least one serial number')
      return
    }
    if (overAvailable) {
      toast.warning(`Only ${availableQty.toLocaleString()} unit(s) available to serialize`)
      return
    }
    if (hasDuplicates) {
      toast.warning('Duplicate serial numbers entered')
      return
    }

    assignSerials.mutate({ productId, locationId, serialNumbers: serials }, { onSuccess: () => onOpenChange(false) })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Assign serial numbers</DialogTitle>
          <div className="text-xs text-[var(--text-3)]">
            {productName} · {locationLabel}
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-2 py-2">
          <Label className="text-[11.5px] font-semibold text-[var(--text-2)]">Serial numbers</Label>
          <Textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="One serial per line"
            rows={6}
            className="w-full resize-none font-mono text-[12px]"
          />
          <div
            className="text-[10.5px] font-semibold"
            style={{ color: count === 0 ? 'var(--text-3)' : overAvailable || hasDuplicates ? 'var(--red)' : 'var(--green)' }}
          >
            {count} of {availableQty.toLocaleString()} unassigned unit(s) entered
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={assignSerials.isPending}>
            <Fingerprint data-icon="inline-start" />
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
