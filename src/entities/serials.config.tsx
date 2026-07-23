import { z } from 'zod'
import type { EntityTableConfig, SerialStatus } from './types'
import { MonoCell, SubCell, ToneBadge } from '@/components/entity-table/cells'
import { serialStatusTone } from '@/lib/tone'

const serialStatusValues = ['IN_STOCK', 'ISSUED', 'RETURNED', 'DAMAGED'] as const

export const createSerialSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  currentBranchId: z.string().optional(),
  currentLocationId: z.string().optional(),
})

export const updateSerialSchema = z.object({
  status: z.enum(serialStatusValues).optional(),
  currentBranchId: z.string().nullable().optional(),
  currentLocationId: z.string().nullable().optional(),
})

export type CreateSerialInput = z.infer<typeof createSerialSchema>
export type UpdateSerialInput = z.infer<typeof updateSerialSchema>

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
      { key: 'IN_STOCK', label: 'In stock', queryParam: { key: 'status', value: 'IN_STOCK' } },
      { key: 'ISSUED', label: 'Issued', queryParam: { key: 'status', value: 'ISSUED' } },
      { key: 'RETURNED', label: 'Returned', queryParam: { key: 'status', value: 'RETURNED' } },
      { key: 'DAMAGED', label: 'Damaged', queryParam: { key: 'status', value: 'DAMAGED' } },
    ],
    columns: [
      { key: 'serialNumber', header: 'Serial #', sortable: true, sortValue: (r) => r.serialNumber, render: (r) => <MonoCell value={r.serialNumber} weight={600} /> },
      { key: 'name', header: 'Product', render: (r) => <SubCell main={r.name} sub={r.code} /> },
      { key: 'status', header: 'Status', render: (r) => <ToneBadge tone={serialStatusTone(r.status)} label={r.status.replace('_', ' ')} dot /> },
      { key: 'locationLabel', header: 'Location', render: (r) => <MonoCell value={r.locationLabel} color="var(--text-2)" /> },
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
