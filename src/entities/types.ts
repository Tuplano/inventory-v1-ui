import { z } from 'zod'
import type { ComponentType, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

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
  | 'PRODUCTION_CONSUME'
  | 'PRODUCTION_OUTPUT'
export type PoStatus = 'DRAFT' | 'CONFIRMED' | 'PARTIAL_RECEIVED' | 'FULLY_RECEIVED' | 'CLOSED' | 'CANCELLED'

export const entityTableSearchSchema = z.object({
  q: z.string().optional(),
  sort: z.string().optional(),
  dir: z.enum(['asc', 'desc']).optional(),
  filter: z.string().optional(),
  page: z.number().optional(),
  // Current page's cursor for server-paginated tables (movements, adjustments, receivings,
  // serials). Unlike `page`, this is actually read — see useCursorPager.
  cursor: z.string().optional(),
  recordId: z.string().optional(),
})
export type EntityTableSearch = z.infer<typeof entityTableSearchSchema>

export interface EntityColumn<TRow> {
  key: string
  header: string
  sortable?: boolean
  align?: 'left' | 'right' | 'center'
  render: (row: TRow) => ReactNode
  sortValue?: (row: TRow) => string | number
}

export interface EntityFilterChip<TRow> {
  key: string
  label: string
  /** Client-side filter, used by tables that load their full dataset (most entities). */
  predicate?: (row: TRow) => boolean
  /** Server-side filter, used by tables in serverPagination mode (movements, adjustments, serials) — sent as a query param instead of filtering in-memory. */
  queryParam?: { key: string; value: string }
}

export interface DrawerSectionRow {
  label: string
  value: ReactNode
  tone?: Tone
}

export interface DrawerSection {
  label: string
  rows: DrawerSectionRow[]
}

export interface DrawerContent {
  title: string
  subtitle?: string
  badge?: { label: string; tone: Tone }
  sections: DrawerSection[]
}

export interface EntityTableConfig<TRow> {
  key: string
  title: string
  subtitle?: string
  icon?: LucideIcon
  columns: EntityColumn<TRow>[]
  searchKeys: Array<keyof TRow>
  filters?: EntityFilterChip<TRow>[]
  primaryActionLabel?: string
  getRowId: (row: TRow) => string
  drawer?: (row: TRow) => DrawerContent
  /** Optional component rendered below the drawer's static sections, for data that needs its own fetch (e.g. bin locations). */
  drawerExtra?: ComponentType<{ row: TRow }>
  getRowHref?: (row: TRow) => string
  pageSize?: number
}
