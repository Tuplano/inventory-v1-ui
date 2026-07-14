import type { Setting } from '../types'

export const settings: Setting[] = [
  { id: 'inventory.negative_stock', key: 'inventory.negative_stock', value: 'blocked', type: 'enum' },
  { id: 'inventory.low_stock_alert', key: 'inventory.low_stock_alert', value: 'enabled', type: 'boolean' },
  { id: 'po.auto_number_prefix', key: 'po.auto_number_prefix', value: 'PO-{YYYY}-', type: 'string' },
  { id: 'po.require_approval_over', key: 'po.require_approval_over', value: '5000.00', type: 'currency' },
  { id: 'batch.expiry_warning_days', key: 'batch.expiry_warning_days', value: '60', type: 'number' },
  { id: 'movement.default_receiving_loc', key: 'movement.default_receiving_loc', value: 'RCV-DOCK-1', type: 'string' },
  { id: 'locale.default_currency', key: 'locale.default_currency', value: 'USD', type: 'enum' },
]
