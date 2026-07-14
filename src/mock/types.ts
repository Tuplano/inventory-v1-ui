export type Tone = 'green' | 'amber' | 'red' | 'violet' | 'teal' | 'accent' | 'neutral'

export type TrackingMode = 'NONE' | 'BATCH' | 'SERIAL'
export type LocationType = 'STORAGE' | 'RECEIVING' | 'STAGING' | 'DISPATCH' | 'GENERAL'
export type SerialStatus = 'IN_STOCK' | 'ISSUED' | 'RETURNED' | 'DAMAGED'
export type MovementType =
  | 'RECEIVING'
  | 'ISSUE'
  | 'ADJUSTMENT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'RETURN'
export type PoStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'PARTIAL_RECEIVED'
  | 'FULLY_RECEIVED'
  | 'CLOSED'
  | 'CANCELLED'
export type GlobalRole = 'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER'
export type UserStatus = 'Active' | 'Invited'
export type SettingType = 'enum' | 'boolean' | 'string' | 'currency' | 'number'

export interface Company {
  id: string
  name: string
  code: string
  color: string
  legal: string
  tax: string
  email: string
  active: boolean
}

export interface Branch {
  id: string
  companyId: string
  name: string
  code: string
  address: string
  active: boolean
}

export interface Category {
  id: string
  name: string
  code: string
  description: string
  branchId: string
  products: number
}

export interface Uom {
  id: string
  code: string
  name: string
  type: 'PIECE' | 'VOLUME'
}

export interface UomConversion {
  id: string
  from: string
  to: string
  factor: number
}

export interface Supplier {
  id: string
  code: string
  name: string
  contact: string
  email: string
  phone: string
  address: string
  active: boolean
}

export interface Product {
  id: string
  code: string
  name: string
  cat: string
  base: string
  purch: string
  sale: string
  track: TrackingMode
  sup: string
}

export interface InventoryItem {
  productId: string
  branchId: string
  qty: number
  min: number
  max: number
  loc: string
}

export interface StockLocation {
  id: string
  code: string
  type: LocationType
  aisle: string
  rack: string
  bin: string
  branchId: string
  cold?: boolean
}

export interface Batch {
  id: string
  productId: string
  batchNo: string
  lot: string
  sup: string
  mfg: string
  expiry: string
  initial: number
  remaining: number
  branchId: string
}

export interface Serial {
  id: string
  productId: string
  serial: string
  status: SerialStatus
  loc: string
  branchId: string
}

export interface StockMovement {
  id: string
  date: string
  type: MovementType
  productId: string
  qty: number
  uom: string
  cost: number
  ref: string
  batch: string
  from: string
  to: string
  branchId: string
}

export interface PoLine {
  id: string
  productId: string
  uom: string
  ordered: number
  received: number
  cost: number
  isClosed: boolean
}

export interface PurchaseOrder {
  id: string
  number: string
  sup: string
  branchId: string
  status: PoStatus
  orderDate: string
  expected: string
  lines: PoLine[]
}

export interface ReceivingLine {
  poLineId: string
  productId: string
  uom: string
  qty: number
  cost: number
  batchNo: string
  toLoc: string
}

export interface Receiving {
  id: string
  number: string
  poId: string
  poNumber: string
  sup: string
  ref: string
  date: string
  by: string
  branchId: string
  lines: ReceivingLine[]
}

export interface Permission {
  id: string
  code: string
  module: string
  desc: string
}

export interface Role {
  id: string
  name: string
  code: string
  desc: string
  companyId: string
  perms: number
  users: number
}

export interface AppUser {
  id: string
  name: string
  email: string
  gRole: GlobalRole
  companyRole: string
  allBranches: boolean
  branches: number
  status: UserStatus
  last: string
}

export interface Setting {
  id: string
  key: string
  value: string
  type: SettingType
}

export interface MockDb {
  companies: Company[]
  branches: Branch[]
  categories: Category[]
  uoms: Uom[]
  conversions: UomConversion[]
  suppliers: Supplier[]
  products: Product[]
  inventory: InventoryItem[]
  locations: StockLocation[]
  batches: Batch[]
  serials: Serial[]
  movements: StockMovement[]
  purchaseOrders: PurchaseOrder[]
  receivings: Receiving[]
  permissions: Permission[]
  roles: Role[]
  users: AppUser[]
  settings: Setting[]
}
