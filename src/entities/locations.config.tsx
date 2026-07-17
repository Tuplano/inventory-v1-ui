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
      { key: 'aisle', header: 'Aisle', render: (r) => <MonoCell value={r.aisle ?? '—'} color="var(--text-2)" /> },
      { key: 'bay', header: 'Bay', render: (r) => <MonoCell value={r.bay ?? '—'} color="var(--text-2)" /> },
      { key: 'level', header: 'Level', render: (r) => <MonoCell value={r.level ?? '—'} color="var(--text-2)" /> },
      { key: 'bin', header: 'Bin', render: (r) => <MonoCell value={r.bin ?? '—'} color="var(--text-2)" /> },
      { key: 'isActive', header: 'Status', render: (r) => <ToneBadge tone={r.isActive ? 'green' : 'neutral'} label={r.isActive ? 'Active' : 'Inactive'} dot /> },
    ],
    drawer: (row) => ({
      title: row.name,
      subtitle: row.code,
      badge: { label: row.isActive ? 'Active' : 'Inactive', tone: row.isActive ? 'green' : 'neutral' },
      sections: [
        {
          label: 'Placement',
          rows: [
            { label: 'Type', value: row.type },
            { label: 'Aisle', value: row.aisle ?? '—' },
            { label: 'Bay', value: row.bay ?? '—' },
            { label: 'Level', value: row.level ?? '—' },
            { label: 'Bin', value: row.bin ?? '—' },
            { label: 'Capacity', value: row.capacity != null ? String(row.capacity) : '—' },
          ],
        },
      ],
    }),
  }
}
