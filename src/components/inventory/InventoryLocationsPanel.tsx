import { useNavigate } from '@tanstack/react-router'
import { useInventoryItemLocations } from '@/hooks/queries/use-inventory-item-locations'
import type { InventoryRow } from '@/entities/inventory.config'

export function InventoryLocationsPanel({ row }: { row: InventoryRow }) {
  const navigate = useNavigate()
  const { data: locations, isLoading } = useInventoryItemLocations(row.id)

  return (
    <div className="mb-5">
      <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--text-3)]">Locations</div>

      {isLoading && <div className="py-2 text-xs text-[var(--text-3)]">Loading…</div>}

      {!isLoading && locations?.length === 0 && (
        <div className="py-2 text-xs text-[var(--text-3)]">Not placed in any bin location.</div>
      )}

      {!isLoading &&
        locations?.map((loc) => {
          const path = [loc.aisle, loc.bay, loc.level, loc.bin].filter(Boolean).join(' · ')
          return (
            <button
              key={`${loc.receivingLineId ?? 'serial'}-${loc.locationId}`}
              type="button"
              onClick={() => navigate({ to: '/locations/$id', params: { id: loc.locationId } })}
              className="flex w-full items-start justify-between gap-3 border-b border-[var(--border-2)] py-1.5 text-left hover:bg-[var(--surface-2)]"
            >
              <div>
                <div className="text-xs font-medium text-[var(--brand-accent)]">{loc.locationName}</div>
                <div className="font-mono text-[10.5px] text-[var(--text-3)]">
                  {loc.locationCode}
                  {path && ` · ${path}`}
                </div>
                {loc.serialNumbers && (
                  <div className="mt-0.5 font-mono text-[10px] text-[var(--text-3)]">{loc.serialNumbers.join(', ')}</div>
                )}
              </div>
              <div className="text-right font-mono text-[12.5px] font-medium">{loc.quantity.toLocaleString()}</div>
            </button>
          )
        })}
    </div>
  )
}
