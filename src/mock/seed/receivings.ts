import type { Receiving } from '../types'

export const receivings: Receiving[] = [
  {
    id: 'rc1', number: 'PO-2026-0153-R1', poId: 'po2', poNumber: 'PO-2026-0153', sup: 's3',
    ref: 'DR-88412', date: '2026-07-10', by: 'Tom Okafor', branchId: 'b1',
    lines: [
      { poLineId: 'ln4', productId: 'p5', uom: 'CASE', qty: 6, cost: 305.00, batchNo: 'INF25FLU1', toLoc: 'C-01-01' },
    ],
  },
  {
    id: 'rc2', number: 'PO-2026-0151-R1', poId: 'po3', poNumber: 'PO-2026-0151', sup: 's4',
    ref: 'INV-22190', date: '2026-07-05', by: 'Tom Okafor', branchId: 'b1',
    lines: [
      { poLineId: 'ln6', productId: 'p9', uom: 'CASE', qty: 15, cost: 96.00, batchNo: '', toLoc: 'B-01-01' },
      { poLineId: 'ln7', productId: 'p10', uom: 'CASE', qty: 6, cost: 210.00, batchNo: '', toLoc: 'B-01-04' },
    ],
  },
  {
    id: 'rc3', number: 'PO-2026-0148-R1', poId: 'po6', poNumber: 'PO-2026-0148', sup: 's1',
    ref: 'DR-87901', date: '2026-07-01', by: 'Marcus Webb', branchId: 'b1',
    lines: [
      { poLineId: 'ln10', productId: 'p1', uom: 'BOX', qty: 12, cost: 42.00, batchNo: 'AMX24K118', toLoc: 'A-01-03' },
    ],
  },
]
