import type { MovementType, StockMovement } from '../types'

function movementDate(offsetDays: number) {
  const d = new Date('2026-07-13')
  d.setDate(d.getDate() - offsetDays)
  return d.toISOString().slice(0, 10)
}

const raw: [number, MovementType, string, number, string, number, string, string, string, string][] = [
  [1, 'RECEIVING', 'p1', 1200, 'BOX', 0.42, 'PO-2026-0148', 'AMX24K118', '', 'A-01-03'],
  [1, 'ISSUE', 'p3', -800, 'EA', 0, 'ISS-5521', 'PAR24H320', 'A-01-06', ''],
  [2, 'RECEIVING', 'p5', 240, 'VIAL', 6.10, 'PO-2026-0151', 'INF25FLU1', '', 'C-01-01'],
  [2, 'ADJUSTMENT', 'p9', -6, 'BOX', 0, 'ADJ-0912', '', 'B-01-01', ''],
  [3, 'TRANSFER_OUT', 'p10', -400, 'EA', 0, 'TRF-3301', '', 'B-01-04', 'EWR-02'],
  [3, 'ISSUE', 'p1', -350, 'EA', 0, 'ISS-5522', 'AMX24K118', 'A-01-03', ''],
  [4, 'RETURN', 'p13', 2, 'EA', 0, 'RET-0231', '', '', 'D-01-02'],
  [5, 'RECEIVING', 'p2', 96, 'VIAL', 3.40, 'PO-2026-0139', 'CEF25A044', '', 'A-02-01'],
  [6, 'ISSUE', 'p6', -80, 'VIAL', 0, 'ISS-5523', 'COVMR2510', 'C-01-02', ''],
  [7, 'TRANSFER_IN', 'p4', 600, 'EA', 0, 'TRF-3299', '', 'RNO-03', 'A-01-08'],
  [8, 'ADJUSTMENT', 'p11', -4, 'BOX', 0, 'ADJ-0908', '', 'B-02-02', ''],
  [9, 'RECEIVING', 'p7', 150, 'EA', 18.20, 'PO-2026-0132', 'INS25G077', '', 'C-02-04'],
  [10, 'ISSUE', 'p12', -1, 'EA', 0, 'ISS-5510', '', 'D-01-01', ''],
  [11, 'RECEIVING', 'p3', 5000, 'EA', 0.03, 'PO-2026-0128', 'PAR24H320', '', 'A-01-06'],
  [12, 'ISSUE', 'p10', -1200, 'EA', 0, 'ISS-5501', '', 'B-01-04', ''],
  [13, 'RETURN', 'p8', 12, 'EA', 0, 'RET-0228', '', '', 'B-03-02'],
]

export const movements: StockMovement[] = raw.map((r, i) => ({
  id: 'mv' + (i + 1),
  date: movementDate(r[0]),
  type: r[1],
  productId: r[2],
  qty: r[3],
  uom: r[4],
  cost: r[5],
  ref: r[6],
  batch: r[7],
  from: r[8],
  to: r[9],
  branchId: 'b1',
}))
