import type { EntityTableConfig } from './types'
import { MonoCell } from '@/components/entity-table/cells'
import { formatCurrency } from '@/lib/format'

export interface SupplierReturnLineRow {
  id: string
  receivingLineId: string
  productId: string
  qty: number
  uom: string
  fromLoc: string
}

export interface SupplierReturnRow {
  id: string
  number: string
  poId: string
  poNumber: string
  supplierName: string
  ref: string
  reason: string
  date: string
  by: string
  lineCount: number
  units: number
  value: number
  lines: SupplierReturnLineRow[]
  productCode: (productId: string) => string
}

export function createSupplierReturnsConfig(branchName: string): EntityTableConfig<SupplierReturnRow> {
  return {
    key: 'supplier-returns',
    title: 'Supplier returns',
    // Explicitly scoped to PO-linked stock going back out, as opposed to Adjustments (no PO
    // involved) — see the same cross-reference on that page's subtitle.
    subtitle: `Send stock already received on a PO back to the supplier · ${branchName}`,
    primaryActionLabel: 'New return',
    searchKeys: ['number', 'ref', 'poNumber'],
    getRowId: (row) => row.id,
    columns: [
      { key: 'number', header: 'Return #', sortable: true, sortValue: (r) => r.number, render: (r) => <MonoCell value={r.number} color="var(--brand-accent-d)" weight={600} /> },
      { key: 'poNumber', header: 'PO #', render: (r) => <MonoCell value={r.poNumber} color="var(--text-2)" /> },
      { key: 'supplierName', header: 'Supplier', render: (r) => <span className="font-medium">{r.supplierName}</span> },
      { key: 'ref', header: 'Ref', render: (r) => <MonoCell value={r.ref} color="var(--text-2)" /> },
      { key: 'date', header: 'Date', sortable: true, sortValue: (r) => r.date, render: (r) => <MonoCell value={r.date} color="var(--text-2)" /> },
      { key: 'lineCount', header: 'Lines', render: (r) => <span className="font-mono text-[12px]">{r.lineCount}</span> },
      { key: 'units', header: 'Units', render: (r) => <span className="font-mono text-[12px] font-semibold text-[var(--red)]">{r.units.toLocaleString()}</span> },
      { key: 'value', header: 'Value', render: (r) => <span className="font-mono text-[12px] font-semibold">{formatCurrency(r.value)}</span> },
    ],
    drawer: (row) => ({
      title: row.number,
      subtitle: row.poNumber,
      sections: [
        {
          label: 'Voucher',
          rows: [
            { label: 'PO', value: row.poNumber },
            { label: 'Supplier', value: row.supplierName },
            { label: 'Supplier ref', value: row.ref },
            { label: 'Reason', value: row.reason },
            { label: 'Date', value: row.date },
            { label: 'Returned by', value: row.by },
          ],
        },
        {
          label: `Lines (${row.lines.length})`,
          rows: row.lines.map((l) => ({
            label: row.productCode(l.productId),
            value: `${l.qty.toLocaleString()} ${l.uom} from ${l.fromLoc}`,
          })),
        },
        {
          label: 'Totals',
          rows: [
            { label: 'Units', value: row.units.toLocaleString() },
            { label: 'Value', value: formatCurrency(row.value) },
          ],
        },
      ],
    }),
  }
}
