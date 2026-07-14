import type { EntityTableConfig } from './types'
import type { UomConversion } from '@/mock/types'
import { MonoCell, ToneBadge } from '@/components/entity-table/cells'

export function createConversionsConfig(companyCode: string): EntityTableConfig<UomConversion> {
  return {
    key: 'conversions',
    title: 'UOM conversions',
    subtitle: `Unit-to-unit factors · ${companyCode}`,
    primaryActionLabel: 'New conversion',
    searchKeys: ['from', 'to'],
    getRowId: (row) => row.id,
    columns: [
      { key: 'from', header: 'From', align: 'center', render: (r) => <ToneBadge tone="accent" label={r.from} /> },
      { key: 'to', header: 'To', align: 'center', render: (r) => <ToneBadge tone="neutral" label={r.to} /> },
      { key: 'factor', header: 'Factor', align: 'right', sortable: true, sortValue: (r) => r.factor, render: (r) => <span className="font-mono text-[12px]">{r.factor.toLocaleString()}</span> },
      { key: 'conversion', header: 'Conversion', render: (r) => <MonoCell value={`1 ${r.from} = ${r.factor.toLocaleString()} ${r.to}`} color="var(--text-2)" /> },
    ],
    drawer: (row) => ({
      title: `${row.from} → ${row.to}`,
      subtitle: 'conversion',
      sections: [
        {
          label: 'Conversion',
          rows: [
            { label: 'From unit', value: row.from },
            { label: 'To unit', value: row.to },
            { label: 'Factor', value: `1 ${row.from} = ${row.factor.toLocaleString()} ${row.to}` },
          ],
        },
      ],
    }),
  }
}
