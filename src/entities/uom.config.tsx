import { z } from 'zod'
import type { EntityTableConfig } from './types'
import { ToneBadge } from '@/components/entity-table/cells'

export const uomTypes = ['PIECE', 'WEIGHT', 'VOLUME', 'LENGTH', 'TIME'] as const
export type UomType = (typeof uomTypes)[number]

export interface UomRecord {
  id: string
  companyId: string
  name: string
  abbreviation: string
  type: UomType
  isActive: boolean
}

export interface UomConversionRecord {
  id: string
  companyId: string
  fromUomId: string
  toUomId: string
  /** Serialized as a string on the wire (Prisma Decimal → JSON). */
  conversionFactor: string
}

export interface UomWithConversions extends UomRecord {
  fromConversions: UomConversionRecord[]
  toConversions: UomConversionRecord[]
}

export const createUomSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  abbreviation: z.string().min(1, 'Abbreviation is required').max(10, 'Max 10 characters'),
  type: z.enum(uomTypes),
})

export const updateUomSchema = z.object({
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
})

export const createConversionSchema = z.object({
  toUomId: z.string().min(1, 'Target unit is required'),
  conversionFactor: z.number().positive('Must be greater than 0'),
})

export type CreateUomInput = z.infer<typeof createUomSchema>
export type UpdateUomInput = z.infer<typeof updateUomSchema>
export type CreateConversionInput = z.infer<typeof createConversionSchema>

function typeTone(type: UomType) {
  return type === 'VOLUME' ? 'teal' : type === 'WEIGHT' ? 'amber' : type === 'LENGTH' ? 'violet' : 'neutral'
}

export function createUomConfig(companyCode: string): EntityTableConfig<UomRecord> {
  return {
    key: 'uom',
    title: 'Units of measure',
    subtitle: `Base units · ${companyCode}`,
    primaryActionLabel: 'New unit',
    searchKeys: ['abbreviation', 'name', 'type'],
    getRowId: (row) => row.id,
    columns: [
      { key: 'abbreviation', header: 'Code', align: 'center', sortable: true, sortValue: (r) => r.abbreviation, render: (r) => <ToneBadge tone="accent" label={r.abbreviation} /> },
      { key: 'name', header: 'Name', sortable: true, sortValue: (r) => r.name, render: (r) => <span className="font-medium">{r.name}</span> },
      { key: 'type', header: 'Type', align: 'center', render: (r) => <ToneBadge tone={typeTone(r.type)} label={r.type} /> },
      { key: 'isActive', header: 'Status', align: 'center', render: (r) => <ToneBadge tone={r.isActive ? 'green' : 'neutral'} label={r.isActive ? 'Active' : 'Inactive'} dot /> },
    ],
    drawer: (row) => ({
      title: row.name,
      subtitle: row.abbreviation,
      badge: { label: row.type, tone: typeTone(row.type) },
      sections: [
        {
          label: 'Unit',
          rows: [
            { label: 'Abbreviation', value: row.abbreviation },
            { label: 'Name', value: row.name },
            { label: 'Type', value: row.type },
            { label: 'Status', value: row.isActive ? 'Active' : 'Inactive' },
          ],
        },
      ],
    }),
  }
}
