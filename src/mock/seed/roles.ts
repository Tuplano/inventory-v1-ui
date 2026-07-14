import type { Role } from '../types'

export const roles: Role[] = [
  { id: 'r1', name: 'Company Admin', code: 'ADMIN', desc: 'Full access across the tenant', companyId: 'c1', perms: 12, users: 2 },
  { id: 'r2', name: 'Warehouse Manager', code: 'WH_MGR', desc: 'Inventory, movements, receiving', companyId: 'c1', perms: 7, users: 3 },
  { id: 'r3', name: 'Receiving Clerk', code: 'RECV', desc: 'Receive POs, record movements', companyId: 'c1', perms: 4, users: 5 },
  { id: 'r4', name: 'Buyer', code: 'BUYER', desc: 'Create & approve purchase orders', companyId: 'c1', perms: 5, users: 2 },
  { id: 'r5', name: 'Read Only', code: 'VIEW', desc: 'View dashboards & reports', companyId: 'c1', perms: 2, users: 8 },
]
