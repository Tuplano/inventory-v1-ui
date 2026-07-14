import type { MockDb } from '../types'
import { companies } from './companies'
import { branches } from './branches'
import { categories } from './categories'
import { uoms } from './uoms'
import { conversions } from './uom-conversions'
import { suppliers } from './suppliers'
import { products } from './products'
import { inventory } from './inventory'
import { locations } from './locations'
import { batches } from './batches'
import { serials } from './serials'
import { movements } from './movements'
import { purchaseOrders } from './purchase-orders'
import { receivings } from './receivings'
import { permissions } from './permissions'
import { roles } from './roles'
import { users } from './users'
import { settings } from './settings'

export function seed(): MockDb {
  const cats = categories.map((c) => ({ ...c }))
  products.forEach((p) => {
    const c = cats.find((x) => x.name === p.cat)
    if (c) c.products++
  })
  return {
    companies: companies.map((x) => ({ ...x })),
    branches: branches.map((x) => ({ ...x })),
    categories: cats,
    uoms: uoms.map((x) => ({ ...x })),
    conversions: conversions.map((x) => ({ ...x })),
    suppliers: suppliers.map((x) => ({ ...x })),
    products: products.map((x) => ({ ...x })),
    inventory: inventory.map((x) => ({ ...x })),
    locations: locations.map((x) => ({ ...x })),
    batches: batches.map((x) => ({ ...x })),
    serials: serials.map((x) => ({ ...x })),
    movements: movements.map((x) => ({ ...x })),
    purchaseOrders: purchaseOrders.map((p) => ({ ...p, lines: p.lines.map((l) => ({ ...l })) })),
    receivings: receivings.map((r) => ({ ...r, lines: r.lines.map((l) => ({ ...l })) })),
    permissions: permissions.map((x) => ({ ...x })),
    roles: roles.map((x) => ({ ...x })),
    users: users.map((x) => ({ ...x })),
    settings: settings.map((x) => ({ ...x })),
  }
}
