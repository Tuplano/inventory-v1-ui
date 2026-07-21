import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChevronDown, ArrowRightLeft, Fingerprint, Inbox, PackageCheck, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ToneBadge } from '@/components/entity-table/cells'
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
import { LocationFormDialog } from '@/components/locations/LocationFormDialog'
import { TransferStockModal } from '@/components/locations/TransferStockModal'
import { PlaceStockModal } from '@/components/locations/PlaceStockModal'
import { AssignSerialsModal } from '@/components/locations/AssignSerialsModal'
import { useLocation } from '@/hooks/queries/use-location'
import { useUnplacedStock } from '@/hooks/queries/use-unplaced-stock'
import { useProducts } from '@/hooks/queries/use-products'
import { useDeleteLocation } from '@/hooks/mutations/use-delete-location'
import { useProposeAutoPlace } from '@/hooks/mutations/use-propose-auto-place'
import { downloadAutoPlaceProposal } from '@/lib/pdf/auto-place-proposal'

export const Route = createFileRoute('/_authed/locations/$id')({
  component: LocationDetailPage,
})

function LocationDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { data: location, isLoading } = useLocation(id)
  const { data: unplacedStock = [] } = useUnplacedStock()
  const { data: products = [] } = useProducts()
  const deleteLocation = useDeleteLocation()
  const proposeAutoPlace = useProposeAutoPlace()
  const [editOpen, setEditOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [placeOpen, setPlaceOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [assignTarget, setAssignTarget] = useState<{ productId: string; productName: string; availableQty: number } | null>(null)

  const trackingByProduct = new Map(products.map((p) => [p.id, p.trackingType]))

  if (isLoading) return null
  if (!location) {
    return <div className="p-6 text-[13px] text-[var(--text-3)]">Location not found.</div>
  }

  const summary = [
    { label: 'Currently holding', value: location.currentQty.toLocaleString() },
    { label: 'Capacity', value: location.capacity != null ? location.capacity.toLocaleString() : 'Unlimited' },
    { label: 'Available', value: location.available != null ? location.available.toLocaleString() : '—' },
    { label: 'Products stored', value: location.contents.length.toLocaleString() },
  ]

  const barColor =
    location.fillPct == null ? 'var(--text-3)' : location.fillPct >= 100 ? 'var(--red)' : location.fillPct >= 80 ? 'var(--amber)' : 'var(--green)'

  return (
    <div className="p-6">
      <button
        type="button"
        onClick={() => navigate({ to: '/locations' })}
        className="mb-3 flex items-center gap-1.5 text-xs text-[var(--text-3)] hover:text-[var(--text-2)]"
      >
        <ChevronDown className="size-3.5 rotate-90" />
        Locations
      </button>

      <div className="mb-4.5 flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2.5">
            <div className="font-mono text-[20px] font-bold tracking-tight">{location.name}</div>
            <ToneBadge tone={location.isActive ? 'green' : 'neutral'} label={location.isActive ? 'Active' : 'Inactive'} />
          </div>
          <div className="mt-1 text-[12.5px] text-[var(--text-3)]">
            {location.code} · {location.type}
            {[location.aisle, location.bay, location.level, location.bin].some(Boolean) &&
              ' · ' + [location.aisle, location.bay, location.level, location.bin].filter(Boolean).join(' · ')}
          </div>
        </div>
        <div className="flex gap-2">
          {location.type === 'RECEIVING' && (
            <Button
              variant="outline"
              disabled={proposeAutoPlace.isPending || location.contents.length === 0}
              onClick={() =>
                proposeAutoPlace.mutate(location.id, {
                  onSuccess: (result) => {
                    if (result.proposed.length > 0 || result.unplaced.length > 0) {
                      downloadAutoPlaceProposal(location.name, result)
                    }
                  },
                })
              }
            >
              <PackageCheck data-icon="inline-start" />
              Propose storage placement
            </Button>
          )}
          {unplacedStock.length > 0 && (
            <Button variant="outline" onClick={() => setPlaceOpen(true)}>
              <Inbox data-icon="inline-start" />
              Place received stock
            </Button>
          )}
          <Button onClick={() => setTransferOpen(true)}>
            <ArrowRightLeft data-icon="inline-start" />
            Transfer stock
          </Button>
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil data-icon="inline-start" />
            Edit
          </Button>
          <Button variant="outline" className="text-[var(--red)]" onClick={() => setDeleteConfirmOpen(true)}>
            <Trash2 data-icon="inline-start" />
            Delete
          </Button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-4 gap-3">
        {summary.map((s) => (
          <Card key={s.label} className="p-3.5">
            <div className="mb-1 text-[11px] text-[var(--text-3)]">{s.label}</div>
            <div className="font-mono text-[17px] font-bold">{s.value}</div>
          </Card>
        ))}
      </div>

      {location.capacity != null && (
        <Card className="mb-4 p-3.5">
          <div className="mb-1.5 flex items-center justify-between text-[11.5px]">
            <span className="font-semibold text-[var(--text-2)]">Capacity used</span>
            <span className="font-mono text-[var(--text-3)]">{location.fillPct}%</span>
          </div>
          <div className="h-[6px] w-full overflow-hidden rounded-[3px] bg-[var(--surface-3)]">
            <div className="h-full rounded-[3px]" style={{ width: `${location.fillPct}%`, background: barColor }} />
          </div>
        </Card>
      )}

      <Card className="overflow-hidden p-0">
        <div className="border-b border-[var(--border-2)] px-4 py-2.5 text-[13px] font-semibold">Contents</div>
        <Table>
          <TableHeader>
            <TableRow className="bg-[var(--surface-2)] hover:bg-[var(--surface-2)]">
              <TableHead className="text-[11px] font-semibold uppercase text-[var(--text-3)]">Product</TableHead>
              <TableHead className="text-right text-[11px] font-semibold uppercase text-[var(--text-3)]">Quantity</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase text-[var(--text-3)]">Receiving</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase text-[var(--text-3)]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {location.contents.map((c) => {
              // Unserialized lot for a SERIAL-tracked product — can be turned into real serial numbers.
              const canAssignSerials = !c.serialNumbers && c.receivingLineId != null && trackingByProduct.get(c.productId) === 'SERIAL'
              return (
                <TableRow key={c.receivingLineId ?? `serial-${c.productId}`} className="border-b-[var(--border-2)]">
                  <TableCell>
                    <div className="font-medium">{c.productName}</div>
                    <div className="font-mono text-[10.5px] text-[var(--text-3)]">{c.productSku}</div>
                  </TableCell>
                  <TableCell className="text-right font-mono text-[12px] font-semibold">{c.quantity.toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-[12px] text-[var(--text-2)]">
                    {c.serialNumbers ? `${c.serialNumbers.length} serial(s)` : c.receivingNumber}
                  </TableCell>
                  <TableCell className="text-right">
                    {canAssignSerials && (
                      <button
                        type="button"
                        onClick={() =>
                          setAssignTarget({ productId: c.productId, productName: c.productName, availableQty: c.quantity })
                        }
                        className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[var(--brand-accent)] hover:underline"
                      >
                        <Fingerprint className="size-3" />
                        Assign serials
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        {location.contents.length === 0 && (
          <div className="p-8 text-center text-[13px] text-[var(--text-3)]">This location is empty.</div>
        )}
      </Card>

      <LocationFormDialog open={editOpen} onOpenChange={setEditOpen} location={location} />
      <TransferStockModal
        open={transferOpen}
        onOpenChange={setTransferOpen}
        fromLocationId={location.id}
        fromLocationName={location.name}
        contents={location.contents}
      />
      <PlaceStockModal
        open={placeOpen}
        onOpenChange={setPlaceOpen}
        toLocationId={location.id}
        toLocationName={location.name}
      />
      <AssignSerialsModal
        open={assignTarget != null}
        onOpenChange={(next) => {
          if (!next) setAssignTarget(null)
        }}
        productId={assignTarget?.productId ?? ''}
        productName={assignTarget?.productName ?? ''}
        locationId={location.id}
        locationLabel={location.name}
        availableQty={assignTarget?.availableQty ?? 0}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {location.name}?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteLocation.isPending}
              onClick={() => {
                deleteLocation.mutate(location.id, { onSuccess: () => navigate({ to: '/locations' }) })
                setDeleteConfirmOpen(false)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
