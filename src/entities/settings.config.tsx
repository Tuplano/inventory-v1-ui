import type { EntityTableConfig } from './types'
import type { Setting } from '@/mock/types'
import { MonoCell, ToneBadge } from '@/components/entity-table/cells'

export function createSettingsConfig(companyCode: string): EntityTableConfig<Setting> {
  return {
    key: 'settings',
    title: 'Company settings',
    subtitle: `Key/value configuration · ${companyCode}`,
    primaryActionLabel: 'New setting',
    searchKeys: ['key', 'value'],
    getRowId: (row) => row.id,
    columns: [
      { key: 'key', header: 'Key', sortable: true, sortValue: (r) => r.key, render: (r) => <MonoCell value={r.key} color="var(--brand-accent-d)" weight={600} /> },
      { key: 'value', header: 'Value', render: (r) => <MonoCell value={r.value} weight={500} /> },
      { key: 'type', header: 'Type', align: 'center', render: (r) => <ToneBadge tone="neutral" label={r.type} /> },
    ],
    drawer: (row) => ({
      title: row.key,
      subtitle: row.type,
      sections: [
        {
          label: 'Value',
          rows: [
            { label: 'Current', value: row.value },
            { label: 'Type', value: row.type },
          ],
        },
      ],
    }),
  }
}
