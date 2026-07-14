import type { EntityTableConfig } from './types'
import type { LocationType, StockLocation, Tone } from '@/mock/types'
import { MonoCell, ToneBadge } from '@/components/entity-table/cells'

const typeTone: Record<LocationType, Tone> = {
  STORAGE: 'accent',
  RECEIVING: 'green',
  STAGING: 'amber',
  DISPATCH: 'violet',
  GENERAL: 'neutral',
}

export function createLocationsConfig(branchName: string): EntityTableConfig<StockLocation> {
  return {
    key: 'locations',
    title: 'Locations',
    subtitle: `Warehouse bins · ${branchName}`,
    primaryActionLabel: 'New location',
    searchKeys: ['code', 'type'],
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
      { key: 'type', header: 'Type', align: 'center', render: (r) => <ToneBadge tone={typeTone[r.type]} label={r.type} /> },
      { key: 'aisle', header: 'Aisle', align: 'center', render: (r) => <MonoCell value={r.aisle} color="var(--text-2)" /> },
      { key: 'rack', header: 'Rack', align: 'center', render: (r) => <MonoCell value={r.rack} color="var(--text-2)" /> },
      { key: 'bin', header: 'Bin', align: 'center', render: (r) => <MonoCell value={r.bin} color="var(--text-2)" /> },
      {
        key: 'cold',
        header: 'Conditions',
        render: (r) => (
          <span style={{ color: r.cold ? 'var(--teal)' : 'var(--text-3)' }}>{r.cold ? '❄ Cold chain 2–8°C' : 'Ambient'}</span>
        ),
      },
    ],
    drawer: (row) => ({
      title: row.code,
      subtitle: row.type,
      sections: [
        {
          label: 'Placement',
          rows: [
            { label: 'Type', value: row.type },
            { label: 'Aisle', value: row.aisle },
            { label: 'Rack', value: row.rack },
            { label: 'Bin', value: row.bin },
            { label: 'Conditions', value: row.cold ? 'Cold chain 2–8°C' : 'Ambient' },
          ],
        },
      ],
    }),
  }
}
