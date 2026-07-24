import {
  ArrowLeftRight,
  Box,
  ClipboardCheck,
  Factory,
  Hash,
  Home,
  Landmark,
  LayoutGrid,
  Layers,
  MapPin,
  Ruler,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Truck,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  route: string
  to: string
  label: string
  icon: LucideIcon
  badge?: 'lowStock'
  /** Permission code(s) required to see this item. Omit for items visible to any authed user. */
  permissions?: string[]
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ route: 'dashboard', to: '/dashboard', label: 'Dashboard', icon: Home }],
  },
  {
    label: 'Catalog',
    items: [
      { route: 'products', to: '/products', label: 'Products', icon: Box, permissions: ['products.view'] },
      { route: 'categories', to: '/categories', label: 'Categories', icon: Tag, permissions: ['categories.view'] },
      { route: 'uom', to: '/uom', label: 'Units of measure', icon: Ruler, permissions: ['uom.view'] },
      { route: 'suppliers', to: '/suppliers', label: 'Suppliers', icon: Truck, permissions: ['suppliers.view'] },
    ],
  },
  {
    label: 'Inventory',
    items: [
      {
        route: 'inventory',
        to: '/inventory',
        label: 'Inventory items',
        icon: LayoutGrid,
        badge: 'lowStock',
        permissions: ['inventory.view'],
      },
      { route: 'movements', to: '/movements', label: 'Stock movements', icon: ArrowLeftRight, permissions: ['inventory.view'] },
      { route: 'adjustments', to: '/adjustments', label: 'Adjustments', icon: ClipboardCheck, permissions: ['stock-movements.create'] },
      { route: 'locations', to: '/locations', label: 'Locations', icon: MapPin, permissions: ['product-locations.view'] },
      { route: 'batches', to: '/batches', label: 'Batches', icon: Layers, permissions: ['batches.view'] },
      { route: 'serials', to: '/serials', label: 'Serial numbers', icon: Hash, permissions: ['serial-numbers.view'] },
    ],
  },
  {
    label: 'Purchasing',
    items: [
      { route: 'pos', to: '/purchase-orders', label: 'Purchase orders', icon: ShoppingCart, permissions: ['purchase-orders.view'] },
      { route: 'receivings', to: '/receivings', label: 'Receivings', icon: Truck, permissions: ['purchase-orders.view'] },
    ],
  },
  {
    label: 'Manufacturing',
    items: [{ route: 'boms', to: '/boms', label: 'Bills of materials', icon: Factory, permissions: ['bom.view'] }],
  },
  {
    label: 'Admin',
    items: [
      {
        route: 'companies',
        to: '/companies',
        label: 'Companies & branches',
        icon: Landmark,
        permissions: ['company.view', 'branches.view'],
      },
      { route: 'settings', to: '/settings', label: 'Company settings', icon: Settings, permissions: ['company-settings.view'] },
      { route: 'roles', to: '/roles', label: 'Roles', icon: Shield, permissions: ['roles.view'] },
      { route: 'permissions', to: '/permissions', label: 'Permissions', icon: ShieldCheck, permissions: ['permissions.view'] },
      { route: 'users', to: '/users', label: 'Users & access', icon: Users, permissions: ['users.view'] },
    ],
  },
]

/** Permission code(s) required for a given nav `route` key, matching the route's `beforeLoad` guard. */
export function getNavItemPermissions(route: string): string[] | undefined {
  for (const group of navGroups) {
    const item = group.items.find((navItem) => navItem.route === route)
    if (item) return item.permissions
  }
  return undefined
}
