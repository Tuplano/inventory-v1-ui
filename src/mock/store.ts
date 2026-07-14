import { seed } from './seed'
import type {
  AppUser,
  Batch,
  Branch,
  Category,
  Company,
  InventoryItem,
  MockDb,
  Permission,
  PoStatus,
  Product,
  PurchaseOrder,
  Receiving,
  ReceivingLine,
  Role,
  Serial,
  Setting,
  StockLocation,
  StockMovement,
  Supplier,
  Uom,
  UomConversion,
} from './types'

let db: MockDb = seed()

export interface ReceiveLineInput {
  lineId: string
  qty: number
  cost: number
  batchNo: string
  toLoc: string
}

export interface PostReceivingInput {
  poId: string
  ref: string
  date: string
  receivedBy: string
  lines: ReceiveLineInput[]
}

function computePoStatus(lines: PurchaseOrder['lines']): PoStatus {
  const allDone = lines.every((l) => l.received >= l.ordered || l.isClosed)
  const anyRec = lines.some((l) => l.received > 0)
  const fullyRec = lines.every((l) => l.received >= l.ordered)
  if (fullyRec) return 'FULLY_RECEIVED'
  if (allDone && anyRec) return 'CLOSED'
  if (anyRec) return 'PARTIAL_RECEIVED'
  return 'CONFIRMED'
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

async function tick<T>(value: T): Promise<T> {
  return value
}

export const mockStore = {
  // ---------- resets (for tests, if ever needed) ----------
  reset() {
    db = seed()
  },

  // ---------- companies / branches ----------
  listCompanies(): Promise<Company[]> {
    return tick(clone(db.companies))
  },
  getCompany(id: string): Company | undefined {
    return db.companies.find((c) => c.id === id)
  },
  listBranches(): Promise<Branch[]> {
    return tick(clone(db.branches))
  },
  branchesOf(companyId: string): Branch[] {
    return db.branches.filter((b) => b.companyId === companyId)
  },
  getBranch(id: string): Branch | undefined {
    return db.branches.find((b) => b.id === id)
  },

  // ---------- catalog ----------
  listCategories(): Promise<Category[]> {
    return tick(clone(db.categories))
  },
  getCategory(id: string): Category | undefined {
    return db.categories.find((c) => c.id === id)
  },
  listUoms(): Promise<Uom[]> {
    return tick(clone(db.uoms))
  },
  getUom(id: string): Uom | undefined {
    return db.uoms.find((u) => u.id === id)
  },
  listConversions(): Promise<UomConversion[]> {
    return tick(clone(db.conversions))
  },
  getConversion(id: string): UomConversion | undefined {
    return db.conversions.find((c) => c.id === id)
  },
  listSuppliers(): Promise<Supplier[]> {
    return tick(clone(db.suppliers))
  },
  getSupplier(id: string): Supplier | undefined {
    return db.suppliers.find((s) => s.id === id)
  },
  supplierName(id: string): string {
    return db.suppliers.find((s) => s.id === id)?.name ?? ''
  },
  listProducts(): Promise<Product[]> {
    return tick(clone(db.products))
  },
  getProduct(id: string): Product | undefined {
    return db.products.find((p) => p.id === id)
  },

  // ---------- inventory ----------
  listInventory(): Promise<InventoryItem[]> {
    return tick(clone(db.inventory))
  },
  getInventory(productId: string, branchId: string): InventoryItem | undefined {
    return db.inventory.find((i) => i.productId === productId && i.branchId === branchId)
  },
  listLocations(): Promise<StockLocation[]> {
    return tick(clone(db.locations))
  },
  getLocation(id: string): StockLocation | undefined {
    return db.locations.find((l) => l.id === id)
  },
  listBatches(): Promise<Batch[]> {
    return tick(clone(db.batches))
  },
  getBatch(id: string): Batch | undefined {
    return db.batches.find((b) => b.id === id)
  },
  listSerials(): Promise<Serial[]> {
    return tick(clone(db.serials))
  },
  getSerial(id: string): Serial | undefined {
    return db.serials.find((s) => s.id === id)
  },
  listMovements(): Promise<StockMovement[]> {
    return tick(clone(db.movements).sort((a, b) => (a.date < b.date ? 1 : -1)))
  },
  getMovement(id: string): StockMovement | undefined {
    return db.movements.find((m) => m.id === id)
  },

  // ---------- purchasing ----------
  listPurchaseOrders(): Promise<PurchaseOrder[]> {
    return tick(clone(db.purchaseOrders))
  },
  getPurchaseOrder(id: string): Promise<PurchaseOrder | undefined> {
    return tick(clone(db.purchaseOrders.find((p) => p.id === id)))
  },
  listReceivings(): Promise<Receiving[]> {
    return tick(clone(db.receivings))
  },
  getReceiving(id: string): Receiving | undefined {
    return db.receivings.find((r) => r.id === id)
  },
  receivingsForPo(poId: string): Receiving[] {
    return db.receivings.filter((r) => r.poId === poId)
  },
  nextReceivingNumber(poNumber: string): string {
    const n = db.receivings.filter((r) => r.poNumber === poNumber).length + 1
    return `${poNumber}-R${n}`
  },

  // ---------- admin ----------
  listPermissions(): Promise<Permission[]> {
    return tick(clone(db.permissions))
  },
  getPermission(id: string): Permission | undefined {
    return db.permissions.find((p) => p.id === id)
  },
  listRoles(): Promise<Role[]> {
    return tick(clone(db.roles))
  },
  getRole(id: string): Role | undefined {
    return db.roles.find((r) => r.id === id)
  },
  listUsers(): Promise<AppUser[]> {
    return tick(clone(db.users))
  },
  getUser(id: string): AppUser | undefined {
    return db.users.find((u) => u.id === id)
  },
  listSettings(): Promise<Setting[]> {
    return tick(clone(db.settings))
  },
  getSetting(id: string): Setting | undefined {
    return db.settings.find((s) => s.id === id)
  },

  // ---------- PO mutations ----------
  async confirmPo(id: string): Promise<PurchaseOrder> {
    const po = db.purchaseOrders.find((p) => p.id === id)
    if (!po) throw new Error('Purchase order not found')
    if (po.status === 'DRAFT') po.status = 'CONFIRMED'
    return clone(po)
  },

  async cancelPo(id: string): Promise<PurchaseOrder> {
    const po = db.purchaseOrders.find((p) => p.id === id)
    if (!po) throw new Error('Purchase order not found')
    po.status = 'CANCELLED'
    return clone(po)
  },

  async closePoLine(poId: string, lineId: string): Promise<PurchaseOrder> {
    const po = db.purchaseOrders.find((p) => p.id === poId)
    if (!po) throw new Error('Purchase order not found')
    const line = po.lines.find((l) => l.id === lineId)
    if (line) line.isClosed = true
    po.status = computePoStatus(po.lines)
    return clone(po)
  },

  async postReceiving(input: PostReceivingInput): Promise<Receiving> {
    const po = db.purchaseOrders.find((p) => p.id === input.poId)
    if (!po) throw new Error('Purchase order not found')

    const date = input.date || new Date().toISOString().slice(0, 10)
    const ref = input.ref || '—'
    const number = mockStore.nextReceivingNumber(po.number)
    const rcvLines: ReceivingLine[] = []

    for (const line of input.lines) {
      const poLine = po.lines.find((l) => l.id === line.lineId)
      if (!poLine || line.qty <= 0) continue

      const product = db.products.find((p) => p.id === poLine.productId)
      const toLoc = line.toLoc || 'RCV-DOCK-1'
      const batchNo = product?.track === 'BATCH' ? line.batchNo : ''

      rcvLines.push({
        poLineId: poLine.id,
        productId: poLine.productId,
        uom: poLine.uom,
        qty: line.qty,
        cost: line.cost,
        batchNo,
        toLoc,
      })

      db.movements.unshift({
        id: 'mv' + (db.movements.length + 1),
        date,
        type: 'RECEIVING',
        productId: poLine.productId,
        qty: line.qty,
        uom: poLine.uom,
        cost: line.cost,
        ref: number,
        batch: batchNo,
        from: '',
        to: toLoc,
        branchId: po.branchId,
      })

      const inv = db.inventory.find((i) => i.productId === poLine.productId && i.branchId === po.branchId)
      if (inv) inv.qty += line.qty

      if (batchNo) {
        const existing = db.batches.find((b) => b.batchNo === batchNo && b.productId === poLine.productId)
        if (existing) {
          existing.remaining += line.qty
          existing.initial += line.qty
        } else {
          db.batches.push({
            id: 'bt' + (db.batches.length + 1),
            productId: poLine.productId,
            batchNo,
            lot: batchNo,
            sup: po.sup,
            mfg: date,
            expiry: '2028-01-01',
            initial: line.qty,
            remaining: line.qty,
            branchId: po.branchId,
          })
        }
      }

      poLine.received += line.qty
    }

    po.status = computePoStatus(po.lines)

    const receiving: Receiving = {
      id: 'rc' + (db.receivings.length + 1),
      number,
      poId: po.id,
      poNumber: po.number,
      sup: po.sup,
      ref,
      date,
      by: input.receivedBy,
      branchId: po.branchId,
      lines: rcvLines,
    }
    db.receivings.unshift(receiving)

    return clone(receiving)
  },
}

export type MockStore = typeof mockStore
