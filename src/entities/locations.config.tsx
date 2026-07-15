import type { EntityTableConfig, LocationType, Tone } from './types'
import { MonoCell, ToneBadge } from '@/components/entity-table/cells'

export interface ProductLocationRecord {
  id: string
  companyId: string
  branchId: string
  name: string
  code: string
  type: LocationType
  aisle: string | null
  rack: string | null
  bin: string | null
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
      { key: 'rack', header: 'Rack', render: (r) => <MonoCell value={r.rack ?? '—'} color="var(--text-2)" /> },
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
            { label: 'Rack', value: row.rack ?? '—' },
            { label: 'Bin', value: row.bin ?? '—' },
          ],
        },
      ],
    }),
  }
}
