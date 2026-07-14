import type { EntityTableConfig, SerialStatus } from './types'
import { MonoCell, SubCell, ToneBadge } from '@/components/entity-table/cells'
import { serialStatusTone } from '@/lib/tone'

export interface SerialRecord {
  id: string
  companyId: string
  productId: string
  serialNumber: string
  status: SerialStatus
  currentBranchId: string | null
  currentLocationId: string | null
  createdAt: string
}

export interface SerialRow extends SerialRecord {
  code: string
  name: string
  locationLabel: string
}

export function createSerialsConfig(branchName: string): EntityTableConfig<SerialRow> {
  return {
    key: 'serials',
    title: 'Serial numbers',
    subtitle: `Unit-level tracking · ${branchName}`,
    primaryActionLabel: 'New serial',
    searchKeys: ['serialNumber', 'name'],
    getRowId: (row) => row.id,
    filters: [
      { key: 'all', label: 'All' },
      { key: 'IN_STOCK', label: 'In stock', predicate: (r) => r.status === 'IN_STOCK' },
      { key: 'ISSUED', label: 'Issued', predicate: (r) => r.status === 'ISSUED' },
      { key: 'RETURNED', label: 'Returned', predicate: (r) => r.status === 'RETURNED' },
      { key: 'DAMAGED', label: 'Damaged', predicate: (r) => r.status === 'DAMAGED' },
    ],
    columns: [
      { key: 'serialNumber', header: 'Serial #', sortable: true, sortValue: (r) => r.serialNumber, render: (r) => <MonoCell value={r.serialNumber} weight={600} /> },
      { key: 'name', header: 'Product', render: (r) => <SubCell main={r.name} sub={r.code} /> },
      { key: 'status', header: 'Status', align: 'center', render: (r) => <ToneBadge tone={serialStatusTone(r.status)} label={r.status.replace('_', ' ')} dot /> },
      { key: 'locationLabel', header: 'Location', align: 'center', render: (r) => <MonoCell value={r.locationLabel} color="var(--text-2)" /> },
    ],
    drawer: (row) => ({
      title: row.name,
      subtitle: row.serialNumber,
      badge: { label: row.status.replace('_', ' '), tone: serialStatusTone(row.status) },
      sections: [
        {
          label: 'Unit',
          rows: [
            { label: 'Product', value: row.name },
            { label: 'Status', value: row.status.replace('_', ' ') },
            { label: 'Location', value: row.locationLabel },
            { label: 'Branch', value: branchName },
          ],
        },
      ],
    }),
  }
}
