import type { Serial } from '../types'

export const serials: Serial[] = [
  { id: 'sr1', productId: 'p12', serial: 'BPM-2024-00412', status: 'IN_STOCK', loc: 'D-01-01', branchId: 'b1' },
  { id: 'sr2', productId: 'p12', serial: 'BPM-2024-00413', status: 'IN_STOCK', loc: 'D-01-01', branchId: 'b1' },
  { id: 'sr3', productId: 'p12', serial: 'BPM-2023-00988', status: 'ISSUED', loc: '—', branchId: 'b1' },
  { id: 'sr4', productId: 'p13', serial: 'OX-2025-10233', status: 'IN_STOCK', loc: 'D-01-02', branchId: 'b1' },
  { id: 'sr5', productId: 'p13', serial: 'OX-2025-10234', status: 'DAMAGED', loc: 'QA-HOLD', branchId: 'b1' },
  { id: 'sr6', productId: 'p13', serial: 'OX-2024-09871', status: 'RETURNED', loc: 'D-01-02', branchId: 'b1' },
  { id: 'sr7', productId: 'p14', serial: 'IRT-2025-55120', status: 'IN_STOCK', loc: 'D-01-03', branchId: 'b1' },
  { id: 'sr8', productId: 'p14', serial: 'IRT-2025-55121', status: 'IN_STOCK', loc: 'D-01-03', branchId: 'b1' },
  { id: 'sr9', productId: 'p14', serial: 'IRT-2024-54012', status: 'ISSUED', loc: '—', branchId: 'b1' },
]
