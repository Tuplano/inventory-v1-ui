import type { EntityTableConfig } from './types'
import { MonoCell, ToneBadge } from '@/components/entity-table/cells'

/**
 * The real GET /api/v1/company-settings endpoint returns a single fixed-shape
 * settings object (one row per company with named boolean/enum fields), not an
 * arbitrary key/value list like the mock's `Setting[]`. `use-settings.ts`
 * flattens that object's known fields into synthetic rows so this page can
 * keep using the existing EntityTableView list layout without fabricating
 * data — every row still reflects a real field the API returned.
 */
export interface SettingRow {
  id: string
  key: string
  value: string
  type: 'boolean' | 'enum'
}

export function createSettingsConfig(companyCode: string): EntityTableConfig<SettingRow> {
  return {
    key: 'settings',
    title: 'Company settings',
    subtitle: `Feature configuration · ${companyCode}`,
    searchKeys: ['key', 'value'],
    getRowId: (row) => row.id,
    columns: [
      { key: 'key', header: 'Key', sortable: true, sortValue: (r) => r.key, render: (r) => <MonoCell value={r.key} color="var(--brand-accent-d)" weight={600} /> },
      { key: 'value', header: 'Value', render: (r) => <MonoCell value={r.value} weight={500} /> },
      { key: 'type', header: 'Type', render: (r) => <ToneBadge tone="neutral" label={r.type} /> },
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
