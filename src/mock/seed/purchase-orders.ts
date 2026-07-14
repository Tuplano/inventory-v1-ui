import type { PurchaseOrder } from '../types'

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: 'po1', number: 'PO-2026-0155', sup: 's1', branchId: 'b1', status: 'CONFIRMED',
    orderDate: '2026-07-08', expected: '2026-07-16',
    lines: [
      { id: 'ln1', productId: 'p1', uom: 'BOX', ordered: 20, received: 0, cost: 42.00, isClosed: false },
      { id: 'ln2', productId: 'p2', uom: 'CASE', ordered: 8, received: 0, cost: 81.60, isClosed: false },
      { id: 'ln3', productId: 'p4', uom: 'BOX', ordered: 30, received: 0, cost: 15.00, isClosed: false },
    ],
  },
  {
    id: 'po2', number: 'PO-2026-0153', sup: 's3', branchId: 'b1', status: 'PARTIAL_RECEIVED',
    orderDate: '2026-07-05', expected: '2026-07-14',
    lines: [
      { id: 'ln4', productId: 'p5', uom: 'CASE', ordered: 12, received: 6, cost: 305.00, isClosed: false },
      { id: 'ln5', productId: 'p6', uom: 'CASE', ordered: 10, received: 0, cost: 420.00, isClosed: false },
    ],
  },
  {
    id: 'po3', number: 'PO-2026-0151', sup: 's4', branchId: 'b1', status: 'FULLY_RECEIVED',
    orderDate: '2026-07-01', expected: '2026-07-06',
    lines: [
      { id: 'ln6', productId: 'p9', uom: 'CASE', ordered: 15, received: 15, cost: 96.00, isClosed: false },
      { id: 'ln7', productId: 'p10', uom: 'CASE', ordered: 6, received: 6, cost: 210.00, isClosed: false },
    ],
  },
  {
    id: 'po4', number: 'PO-2026-0156', sup: 's2', branchId: 'b1', status: 'DRAFT',
    orderDate: '2026-07-12', expected: '2026-07-22',
    lines: [
      { id: 'ln8', productId: 'p3', uom: 'BOX', ordered: 40, received: 0, cost: 12.50, isClosed: false },
    ],
  },
  {
    id: 'po5', number: 'PO-2026-0149', sup: 's5', branchId: 'b1', status: 'CANCELLED',
    orderDate: '2026-06-28', expected: '2026-07-30',
    lines: [
      { id: 'ln9', productId: 'p12', uom: 'EA', ordered: 10, received: 0, cost: 64.00, isClosed: false },
    ],
  },
  {
    id: 'po6', number: 'PO-2026-0148', sup: 's1', branchId: 'b1', status: 'FULLY_RECEIVED',
    orderDate: '2026-06-24', expected: '2026-07-02',
    lines: [
      { id: 'ln10', productId: 'p1', uom: 'BOX', ordered: 12, received: 12, cost: 42.00, isClosed: false },
    ],
  },
]
