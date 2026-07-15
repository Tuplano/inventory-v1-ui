import type { EntityTableConfig } from './types'
import { MonoCell } from '@/components/entity-table/cells'
import { formatCurrency } from '@/lib/format'

export interface ReceivingLineRow {
  id: string
  purchaseOrderLineId: string
  productId: string
  qty: number
  uom: string
  toLoc: string
}

export interface ReceivingRow {
  id: string
  number: string
  poId: string
  poNumber: string
  supplierName: string
  ref: string
  date: string
  by: string
  lineCount: number
  units: number
  value: number
  lines: ReceivingLineRow[]
  productCode: (productId: string) => string
}

export function createReceivingsConfig(branchName: string): EntityTableConfig<ReceivingRow> {
  return {
    key: 'receivings',
    title: 'Receivings',
    subtitle: `Goods-receipt vouchers · ${branchName}`,
    primaryActionLabel: 'New receiving',
    searchKeys: ['number', 'ref', 'poNumber'],
    getRowId: (row) => row.id,
    columns: [
      { key: 'number', header: 'Receiving #', sortable: true, sortValue: (r) => r.number, render: (r) => <MonoCell value={r.number} color="var(--brand-accent-d)" weight={600} /> },
      { key: 'poNumber', header: 'PO #', render: (r) => <MonoCell value={r.poNumber} color="var(--text-2)" /> },
      { key: 'supplierName', header: 'Supplier', render: (r) => <span className="font-medium">{r.supplierName}</span> },
      { key: 'ref', header: 'Ref', render: (r) => <MonoCell value={r.ref} color="var(--text-2)" /> },
      { key: 'date', header: 'Date', sortable: true, sortValue: (r) => r.date, render: (r) => <MonoCell value={r.date} color="var(--text-2)" /> },
      { key: 'lineCount', header: 'Lines', render: (r) => <span className="font-mono text-[12px]">{r.lineCount}</span> },
      { key: 'units', header: 'Units', render: (r) => <span className="font-mono text-[12px] font-semibold text-[var(--green)]">{r.units.toLocaleString()}</span> },
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
            { label: 'Date', value: row.date },
            { label: 'Received by', value: row.by },
          ],
        },
        {
          label: `Lines (${row.lines.length})`,
          rows: row.lines.map((l) => ({
            label: row.productCode(l.productId),
            value: `${l.qty.toLocaleString()} ${l.uom} → ${l.toLoc}`,
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
