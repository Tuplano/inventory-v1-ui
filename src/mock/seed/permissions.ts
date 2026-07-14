import type { Permission } from '../types'

export const permissions: Permission[] = [
  { id: 'pm1', code: 'inventory.view', module: 'Inventory', desc: 'View stock levels & items' },
  { id: 'pm2', code: 'inventory.adjust', module: 'Inventory', desc: 'Create stock adjustments' },
  { id: 'pm3', code: 'stock-movements.create', module: 'Inventory', desc: 'Record stock movements' },
  { id: 'pm4', code: 'products.manage', module: 'Catalog', desc: 'Create & edit products' },
  { id: 'pm5', code: 'suppliers.manage', module: 'Catalog', desc: 'Manage suppliers' },
  { id: 'pm6', code: 'purchase-orders.create', module: 'Purchasing', desc: 'Raise purchase orders' },
  { id: 'pm7', code: 'purchase-orders.receive', module: 'Purchasing', desc: 'Receive stock against a PO' },
  { id: 'pm8', code: 'purchase-orders.approve', module: 'Purchasing', desc: 'Confirm / approve POs' },
  { id: 'pm9', code: 'users.manage', module: 'Admin', desc: 'Invite & manage users' },
  { id: 'pm10', code: 'roles.manage', module: 'Admin', desc: 'Manage roles & permissions' },
  { id: 'pm11', code: 'companies.manage', module: 'Admin', desc: 'Manage companies & branches' },
  { id: 'pm12', code: 'settings.manage', module: 'Admin', desc: 'Edit company settings' },
]
