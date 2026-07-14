import { z } from 'zod'
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { Tone } from '@/mock/types'

export const entityTableSearchSchema = z.object({
  q: z.string().optional(),
  sort: z.string().optional(),
  dir: z.enum(['asc', 'desc']).optional(),
  filter: z.string().optional(),
  page: z.number().optional(),
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
  predicate?: (row: TRow) => boolean
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
  getRowHref?: (row: TRow) => string
  pageSize?: number
}
