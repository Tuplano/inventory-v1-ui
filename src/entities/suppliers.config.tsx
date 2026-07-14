import { z } from 'zod'
import type { EntityTableConfig } from './types'
import { MonoCell, SubCell, ToneBadge } from '@/components/entity-table/cells'

export interface SupplierRecord {
  id: string
  companyId: string
  name: string
  code: string
  contactName: string | null
  email: string | null
  phone: string | null
  address: string | null
  isActive: boolean
}

export const createSupplierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  contactName: z.string().optional(),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
})

export const updateSupplierSchema = createSupplierSchema.partial().extend({
  isActive: z.boolean().optional(),
})

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>

export function createSuppliersConfig(companyCode: string): EntityTableConfig<SupplierRecord> {
  return {
    key: 'suppliers',
    title: 'Suppliers',
    subtitle: `Vendors for ${companyCode}`,
    primaryActionLabel: 'New supplier',
    searchKeys: ['code', 'name', 'contactName'],
    getRowId: (row) => row.id,
    columns: [
      { key: 'code', header: 'Code', sortable: true, sortValue: (r) => r.code, render: (r) => <MonoCell value={r.code} weight={600} /> },
      { key: 'name', header: 'Name', sortable: true, sortValue: (r) => r.name, render: (r) => <SubCell main={r.name} sub={r.email ?? ''} subMono={false} /> },
      { key: 'contactName', header: 'Contact', render: (r) => <span className="text-[var(--text-2)]">{r.contactName ?? '—'}</span> },
      { key: 'phone', header: 'Phone', render: (r) => <MonoCell value={r.phone ?? '—'} color="var(--text-2)" /> },
      { key: 'isActive', header: 'Status', align: 'center', render: (r) => <ToneBadge tone={r.isActive ? 'green' : 'neutral'} label={r.isActive ? 'Active' : 'Inactive'} dot /> },
    ],
    drawer: (row) => ({
      title: row.name,
      subtitle: row.code,
      badge: { label: row.isActive ? 'Active' : 'Inactive', tone: row.isActive ? 'green' : 'neutral' },
      sections: [
        {
          label: 'Contact',
          rows: [
            { label: 'Contact', value: row.contactName ?? '—' },
            { label: 'Email', value: row.email ?? '—' },
            { label: 'Phone', value: row.phone ?? '—' },
          ],
        },
        { label: 'Address', rows: [{ label: 'Location', value: row.address ?? '—' }] },
      ],
    }),
  }
}
