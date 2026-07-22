import {
  ArrowLeftRight,
  Box,
  ClipboardCheck,
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
      { route: 'products', to: '/products', label: 'Products', icon: Box },
      { route: 'categories', to: '/categories', label: 'Categories', icon: Tag },
      { route: 'uom', to: '/uom', label: 'Units of measure', icon: Ruler },
      { route: 'suppliers', to: '/suppliers', label: 'Suppliers', icon: Truck },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { route: 'inventory', to: '/inventory', label: 'Inventory items', icon: LayoutGrid, badge: 'lowStock' },
      { route: 'movements', to: '/movements', label: 'Stock movements', icon: ArrowLeftRight },
      { route: 'adjustments', to: '/adjustments', label: 'Adjustments', icon: ClipboardCheck },
      { route: 'locations', to: '/locations', label: 'Locations', icon: MapPin },
      { route: 'batches', to: '/batches', label: 'Batches', icon: Layers },
      { route: 'serials', to: '/serials', label: 'Serial numbers', icon: Hash },
    ],
  },
  {
    label: 'Purchasing',
    items: [
      { route: 'pos', to: '/purchase-orders', label: 'Purchase orders', icon: ShoppingCart },
      { route: 'receivings', to: '/receivings', label: 'Receivings', icon: Truck },
    ],
  },
  {
    label: 'Admin',
    items: [
      { route: 'companies', to: '/companies', label: 'Companies & branches', icon: Landmark },
      { route: 'settings', to: '/settings', label: 'Company settings', icon: Settings },
      { route: 'roles', to: '/roles', label: 'Roles', icon: Shield },
      { route: 'permissions', to: '/permissions', label: 'Permissions', icon: ShieldCheck },
      { route: 'users', to: '/users', label: 'Users & access', icon: Users },
    ],
  },
]
