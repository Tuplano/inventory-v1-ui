import type { StockLocation } from '../types'

export const locations: StockLocation[] = [
  { id: 'l1', code: 'A-01-03', type: 'STORAGE', aisle: 'A', rack: '01', bin: '03', branchId: 'b1' },
  { id: 'l2', code: 'A-02-01', type: 'STORAGE', aisle: 'A', rack: '02', bin: '01', branchId: 'b1' },
  { id: 'l3', code: 'C-01-01', type: 'STORAGE', aisle: 'C', rack: '01', bin: '01', branchId: 'b1', cold: true },
  { id: 'l4', code: 'C-01-02', type: 'STORAGE', aisle: 'C', rack: '01', bin: '02', branchId: 'b1', cold: true },
  { id: 'l5', code: 'B-01-01', type: 'STORAGE', aisle: 'B', rack: '01', bin: '01', branchId: 'b1' },
  { id: 'l6', code: 'RCV-DOCK-1', type: 'RECEIVING', aisle: '—', rack: '—', bin: '—', branchId: 'b1' },
  { id: 'l7', code: 'STG-01', type: 'STAGING', aisle: '—', rack: '—', bin: '—', branchId: 'b1' },
  { id: 'l8', code: 'DSP-DOCK-2', type: 'DISPATCH', aisle: '—', rack: '—', bin: '—', branchId: 'b1' },
  { id: 'l9', code: 'GEN-FLOOR', type: 'GENERAL', aisle: '—', rack: '—', bin: '—', branchId: 'b1' },
]
