import { z } from 'zod'
import type { EntityTableConfig, LocationType, Tone } from './types'
import { MonoCell, ToneBadge } from '@/components/entity-table/cells'

const locationTypeValues = ['GENERAL', 'RECEIVING', 'STAGING', 'STORAGE', 'DISPATCH'] as const

export const createLocationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  type: z.enum(locationTypeValues).optional(),
  aisle: z.string().optional(),
  bay: z.string().optional(),
  level: z.string().optional(),
  bin: z.string().optional(),
  capacity: z.number().positive().optional(),
})

export const updateLocationSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(locationTypeValues).optional(),
  aisle: z.string().nullable().optional(),
  bay: z.string().nullable().optional(),
  level: z.string().nullable().optional(),
  bin: z.string().nullable().optional(),
  capacity: z.number().positive().nullable().optional(),
  isActive: z.boolean().optional(),
})

export type CreateLocationInput = z.infer<typeof createLocationSchema>
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>

export interface ProductLocationRecord {
  id: string
  companyId: string
  branchId: string
  name: string
  code: string
  type: LocationType
  aisle: string | null
  bay: string | null
  level: string | null
  bin: string | null
  capacity: number | null
  currentQty: number
  isActive: boolean
  createdAt: string
}

const typeTone: Record<LocationType, Tone> = {
  STORAGE: 'accent',
  RECEIVING: 'green',
  STAGING: 'amber',
  DISPATCH: 'violet',
  GENERAL: 'neutral',
}

export function createLocationsConfig(branchName: string): EntityTableConfig<ProductLocationRecord> {
  return {
    key: 'locations',
    title: 'Locations',
    subtitle: `Warehouse bins · ${branchName}`,
    primaryActionLabel: 'New location',
    searchKeys: ['code', 'name'],
    getRowId: (row) => row.id,
    filters: [
      { key: 'all', label: 'All' },
      { key: 'STORAGE', label: 'Storage', predicate: (r) => r.type === 'STORAGE' },
      { key: 'RECEIVING', label: 'Receiving', predicate: (r) => r.type === 'RECEIVING' },
      { key: 'STAGING', label: 'Staging', predicate: (r) => r.type === 'STAGING' },
      { key: 'DISPATCH', label: 'Dispatch', predicate: (r) => r.type === 'DISPATCH' },
      { key: 'GENERAL', label: 'General', predicate: (r) => r.type === 'GENERAL' },
    ],
    columns: [
      { key: 'code', header: 'Code', sortable: true, sortValue: (r) => r.code, render: (r) => <MonoCell value={r.code} weight={600} /> },
      { key: 'name', header: 'Name', sortable: true, sortValue: (r) => r.name, render: (r) => <span className="font-medium">{r.name}</span> },
      { key: 'type', header: 'Type', render: (r) => <ToneBadge tone={typeTone[r.type]} label={r.type} /> },
      {
        key: 'position',
        header: 'Position',
        render: (r) => (
          <MonoCell value={[r.aisle, r.bay, r.level, r.bin].filter(Boolean).join(' · ') || '—'} color="var(--text-2)" />
        ),
      },
      { key: 'fill', header: 'Fill', render: (r) => <LocationFillCell capacity={r.capacity} currentQty={r.currentQty} /> },
      { key: 'isActive', header: 'Status', render: (r) => <ToneBadge tone={r.isActive ? 'green' : 'neutral'} label={r.isActive ? 'Active' : 'Inactive'} dot /> },
    ],
    getRowHref: (row) => `/locations/${row.id}`,
  }
}

function LocationFillCell({ capacity, currentQty }: { capacity: number | null; currentQty: number }) {
  if (capacity == null) {
    return <span className="font-mono text-[11px] text-[var(--text-3)]">Unlimited</span>
  }
  const pct = capacity > 0 ? Math.min(100, Math.round((currentQty / capacity) * 100)) : 100
  const barColor = pct >= 100 ? 'var(--red)' : pct >= 80 ? 'var(--amber)' : 'var(--green)'
  return (
    <div className="flex items-center gap-2">
      <div className="h-[5px] w-[60px] overflow-hidden rounded-[3px] bg-[var(--surface-3)]">
        <div className="h-full rounded-[3px]" style={{ width: `${pct}%`, background: barColor }} />
      </div>
      <span className="font-mono text-[11px] text-[var(--text-3)]">
        {currentQty}/{capacity}
      </span>
    </div>
  )
}
