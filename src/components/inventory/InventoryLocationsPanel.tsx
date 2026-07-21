import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Fingerprint, Inbox } from 'lucide-react'
import { useInventoryItemLocations } from '@/hooks/queries/use-inventory-item-locations'
import { AssignSerialsModal } from '@/components/locations/AssignSerialsModal'
import type { InventoryRow } from '@/entities/inventory.config'

export function InventoryLocationsPanel({ row }: { row: InventoryRow }) {
  const navigate = useNavigate()
  const { data: locations, isLoading } = useInventoryItemLocations(row.id)
  const [assignTarget, setAssignTarget] = useState<{ locationId: string | null; locationLabel: string; availableQty: number } | null>(
    null,
  )

  const isSerialTracked = row.trackingType === 'SERIAL'

  return (
    <div className="mb-5">
      <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--text-3)]">Locations</div>

      {row.floatingQty > 0 && (
        <div className="mb-2 flex items-center gap-2 rounded-lg border border-[var(--amber)]/30 bg-[var(--amber)]/8 px-2.5 py-2">
          <Inbox className="size-3.5 shrink-0 text-[var(--amber)]" />
          <button type="button" onClick={() => navigate({ to: '/locations' })} className="flex-1 text-left text-[11.5px] text-[var(--text-2)]">
            <span className="font-semibold">
              {row.floatingQty.toLocaleString()} {row.base}
            </span>{' '}
            received but not yet placed — open a location to assign it
          </button>
          {isSerialTracked && (
            <button
              type="button"
              onClick={() => setAssignTarget({ locationId: null, locationLabel: 'Unplaced', availableQty: row.floatingQty })}
              className="inline-flex shrink-0 items-center gap-1 text-[10.5px] font-semibold text-[var(--brand-accent)] hover:underline"
            >
              <Fingerprint className="size-3" />
              Assign serials
            </button>
          )}
        </div>
      )}

      {isLoading && <div className="py-2 text-xs text-[var(--text-3)]">Loading…</div>}

      {!isLoading && locations?.length === 0 && (
        <div className="py-2 text-xs text-[var(--text-3)]">Not placed in any bin location.</div>
      )}

      {!isLoading &&
        locations?.map((loc) => {
          const path = [loc.aisle, loc.bay, loc.level, loc.bin].filter(Boolean).join(' · ')
          // Unserialized lot for a SERIAL-tracked product sitting at this location.
          const canAssignSerials = isSerialTracked && !loc.serialNumbers && loc.receivingLineId != null

          return (
            <div
              key={`${loc.receivingLineId ?? 'serial'}-${loc.locationId}`}
              className="flex w-full items-start justify-between gap-3 border-b border-[var(--border-2)] py-1.5"
            >
              <button
                type="button"
                onClick={() => navigate({ to: '/locations/$id', params: { id: loc.locationId } })}
                className="flex-1 text-left hover:underline"
              >
                <div className="text-xs font-medium text-[var(--brand-accent)]">{loc.locationName}</div>
                <div className="font-mono text-[10.5px] text-[var(--text-3)]">
                  {loc.locationCode}
                  {path && ` · ${path}`}
                </div>
                {loc.serialNumbers && (
                  <div className="mt-0.5 font-mono text-[10px] text-[var(--text-3)]">{loc.serialNumbers.join(', ')}</div>
                )}
              </button>
              <div className="flex flex-col items-end gap-1">
                <div className="text-right font-mono text-[12.5px] font-medium">{loc.quantity.toLocaleString()}</div>
                {canAssignSerials && (
                  <button
                    type="button"
                    onClick={() =>
                      setAssignTarget({ locationId: loc.locationId, locationLabel: loc.locationName, availableQty: loc.quantity })
                    }
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--brand-accent)] hover:underline"
                  >
                    <Fingerprint className="size-2.5" />
                    Assign serials
                  </button>
                )}
              </div>
            </div>
          )
        })}

      <AssignSerialsModal
        open={assignTarget != null}
        onOpenChange={(next) => {
          if (!next) setAssignTarget(null)
        }}
        productId={row.productId}
        productName={row.name}
        locationId={assignTarget?.locationId ?? null}
        locationLabel={assignTarget?.locationLabel ?? ''}
        availableQty={assignTarget?.availableQty ?? 0}
      />
    </div>
  )
}
