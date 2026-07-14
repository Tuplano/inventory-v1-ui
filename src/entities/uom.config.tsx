import type { EntityTableConfig } from './types'
import type { Uom, UomConversion } from '@/mock/types'
import { ToneBadge } from '@/components/entity-table/cells'

export interface UomRow extends Uom {
  conversionCount: number
  conversionsList: UomConversion[]
}

export function createUomConfig(companyCode: string): EntityTableConfig<UomRow> {
  return {
    key: 'uom',
    title: 'Units of measure',
    subtitle: `Base units · ${companyCode}`,
    primaryActionLabel: 'New unit',
    searchKeys: ['code', 'name', 'type'],
    getRowId: (row) => row.id,
    columns: [
      { key: 'code', header: 'Code', align: 'center', sortable: true, sortValue: (r) => r.code, render: (r) => <ToneBadge tone="accent" label={r.code} /> },
      { key: 'name', header: 'Name', sortable: true, sortValue: (r) => r.name, render: (r) => <span className="font-medium">{r.name}</span> },
      { key: 'type', header: 'Type', align: 'center', render: (r) => <ToneBadge tone={r.type === 'VOLUME' ? 'teal' : 'neutral'} label={r.type} /> },
      { key: 'conv', header: 'Conversions', render: (r) => <span className="text-[var(--text-2)]">{r.conversionCount} defined</span> },
    ],
    drawer: (row) => ({
      title: row.name,
      subtitle: row.code,
      badge: { label: row.type, tone: row.type === 'VOLUME' ? 'teal' : 'neutral' },
      sections: [
        {
          label: 'Unit',
          rows: [
            { label: 'Code', value: row.code },
            { label: 'Name', value: row.name },
            { label: 'Type', value: row.type },
          ],
        },
        {
          label: 'Conversions',
          rows: row.conversionsList.length
            ? row.conversionsList.map((c) => ({ label: `${c.from} → ${c.to}`, value: `× ${c.factor.toLocaleString()}` }))
            : [{ label: 'None', value: '—' }],
        },
      ],
    }),
  }
}
