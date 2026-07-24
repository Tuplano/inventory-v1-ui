import type { EntityTableConfig, MovementType } from './types'
import { MonoCell, SubCell, ToneBadge } from '@/components/entity-table/cells'
import { movementTypeTone } from '@/lib/tone'

/** Raw wire shape from GET /stock-movements (Decimal fields arrive as strings). */
export interface StockMovementRecord {
  id: string
  companyId: string
  branchId: string
  productId: string
  type: MovementType
  quantity: string
  reference: string | null
  remarks: string | null
  createdById: string | null
  createdBy: { id: string; name: string } | null
  purchaseOrderLineId: string | null
  fromLocationId: string | null
  toLocationId: string | null
  batchId: string | null
  serialNumberId: string | null
  createdAt: string
}

export interface MovementRow {
  id: string
  companyId: string
  branchId: string
  productId: string
  type: MovementType
  quantity: number
  reference: string | null
  remarks: string | null
  fromLocationId: string | null
  toLocationId: string | null
  batchId: string | null
  serialNumberId: string | null
  createdAt: string
  code: string
  name: string
  uom: string
  fromLabel: string
  toLabel: string
  batchLabel: string
  createdByName: string
}

// `quantity` is always stored positive in the DB — direction comes from `type` (and, for
// ADJUSTMENT, which of fromLocationId/toLocationId is set), never from the sign of the number.
export function isOutgoingMovement(row: MovementRow): boolean {
  if (row.type === 'ISSUE' || row.type === 'DEFECTIVE' || row.type === 'TRANSFER_OUT' || row.type === 'PRODUCTION_CONSUME') return true
  if (row.type === 'ADJUSTMENT') return !!row.fromLocationId
  return false
}

export function createMovementsConfig(branchName: string): EntityTableConfig<MovementRow> {
  return {
    key: 'movements',
    title: 'Stock movements',
    subtitle: `Ledger · ${branchName}`,
    searchKeys: ['reference', 'code', 'name'],
    getRowId: (row) => row.id,
    // ISSUE and DEFECTIVE are real again — both are reasons a decrease adjustment can be tagged
    // with (see AdjustStockModal), each its own StockMovementType. RETURN still has no chip:
    // nothing creates it (the manual stock-movement form it came from was removed), so it'd only
    // ever match pre-existing historical rows, if any — it still renders correctly in "All".
    filters: [
      { key: 'all', label: 'All' },
      { key: 'RECEIVING', label: 'Receiving', queryParam: { key: 'type', value: 'RECEIVING' } },
      { key: 'ADJUSTMENT', label: 'Adjustment', queryParam: { key: 'type', value: 'ADJUSTMENT' } },
      { key: 'DEFECTIVE', label: 'Defective', queryParam: { key: 'type', value: 'DEFECTIVE' } },
      { key: 'ISSUE', label: 'Issue', queryParam: { key: 'type', value: 'ISSUE' } },
      { key: 'TRANSFER', label: 'Transfer', queryParam: { key: 'type', value: 'TRANSFER_IN,TRANSFER_OUT' } },
      { key: 'PRODUCTION', label: 'Production', queryParam: { key: 'type', value: 'PRODUCTION_CONSUME,PRODUCTION_OUTPUT' } },
    ],
    columns: [
      { key: 'createdAt', header: 'Date', sortable: true, sortValue: (r) => r.createdAt, render: (r) => <MonoCell value={r.createdAt.slice(0, 10)} color="var(--text-2)" /> },
      { key: 'type', header: 'Type', render: (r) => <ToneBadge tone={movementTypeTone(r.type)} label={r.type.replace('_', ' ')} /> },
      { key: 'name', header: 'Product', render: (r) => <SubCell main={r.name} sub={r.code} /> },
      {
        key: 'quantity',
        header: 'Qty',
        render: (r) => (
          <span className="font-mono text-[12px] font-semibold" style={{ color: isOutgoingMovement(r) ? 'var(--red)' : 'var(--green)' }}>
            {(isOutgoingMovement(r) ? '-' : '+') + r.quantity.toLocaleString()} {r.uom}
          </span>
        ),
      },
      { key: 'route', header: 'From → To', render: (r) => <MonoCell value={`${r.fromLabel} → ${r.toLabel}`} color="var(--text-2)" /> },
      { key: 'createdByName', header: 'By', render: (r) => <MonoCell value={r.createdByName || '—'} color="var(--text-2)" /> },
      { key: 'reference', header: 'Reference', render: (r) => <MonoCell value={r.reference ?? '—'} color="var(--brand-accent-d)" /> },
      { key: 'remarks', header: 'Remarks', render: (r) => <MonoCell value={r.remarks ?? '—'} color="var(--text-2)" /> },
    ],
    drawer: (row) => ({
      title: row.name,
      subtitle: row.reference ?? row.id,
      sections: [
        {
          label: 'Movement',
          rows: [
            { label: 'Type', value: row.type.replace('_', ' '), tone: movementTypeTone(row.type) },
            { label: 'Quantity', value: `${isOutgoingMovement(row) ? '-' : '+'}${row.quantity.toLocaleString()} ${row.uom}` },
            { label: 'By', value: row.createdByName || '—' },
            { label: 'Date', value: row.createdAt.slice(0, 10) },
          ],
        },
        {
          label: 'Trace',
          rows: [
            { label: 'From', value: row.fromLabel },
            { label: 'To', value: row.toLabel },
            { label: 'Batch', value: row.batchLabel || '—' },
            { label: 'Reference', value: row.reference ?? '—' },
            { label: 'Remarks', value: row.remarks ?? '—' },
          ],
        },
      ],
    }),
  }
}
