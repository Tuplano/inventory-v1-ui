import { z } from 'zod'
import type { EntityTableConfig } from './types'
import { MonoCell, SubCell, ToneBadge } from '@/components/entity-table/cells'

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  legalName: z.string().optional(),
  email: z.string().email('Email must be valid').or(z.literal('')).optional(),
  phone: z.string().optional(),
  website: z.string().url('Website must be a valid URL').or(z.literal('')).optional(),
  taxId: z.string().optional(),
})

export const updateCompanySchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  legalName: z.string().optional(),
  email: z.string().email('Email must be valid').or(z.literal('')).optional(),
  phone: z.string().optional(),
  website: z.string().url('Website must be a valid URL').or(z.literal('')).optional(),
  taxId: z.string().optional(),
})

export type CreateCompanyInput = z.infer<typeof createCompanySchema>
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>

export interface CompanyBranch {
  id: string
  companyId: string
  name: string
  code: string
  address: string
  active: boolean
}

export interface CompanyRow {
  id: string
  name: string
  code: string
  color: string
  legal: string
  tax: string
  email: string
  active: boolean
  branchCount: number
  companyBranches: CompanyBranch[]
}

export function createCompaniesConfig({
  onAddBranch,
}: {
  onAddBranch: (row: CompanyRow) => void
}): EntityTableConfig<CompanyRow> {
  return {
    key: 'companies',
    title: 'Companies & branches',
    subtitle: 'Tenant structure',
    primaryActionLabel: 'New company',
    searchKeys: ['name', 'code'],
    getRowId: (row) => row.id,
    columns: [
      { key: 'name', header: 'Company', sortable: true, sortValue: (r) => r.name, render: (r) => <SubCell main={r.name} sub={r.email} subMono={false} /> },
      { key: 'code', header: 'Code', render: (r) => <MonoCell value={r.code} weight={600} /> },
      { key: 'branchCount', header: 'Branches', render: (r) => <span className="font-mono text-[12px]">{r.branchCount}</span> },
      { key: 'legal', header: 'Legal entity', render: (r) => <span className="text-[var(--text-2)]">{r.legal}</span> },
      { key: 'active', header: 'Status', render: (r) => <ToneBadge tone={r.active ? 'green' : 'neutral'} label={r.active ? 'Active' : 'Inactive'} dot /> },
    ],
    drawer: (row) => ({
      title: row.name,
      subtitle: row.code,
      badge: { label: row.active ? 'Active' : 'Inactive', tone: row.active ? 'green' : 'neutral' },
      sections: [
        {
          label: 'Entity',
          rows: [
            { label: 'Legal name', value: row.legal },
            { label: 'Tax ID', value: row.tax },
            { label: 'Email', value: row.email },
          ],
        },
        {
          label: 'Branches',
          rows: [
            ...row.companyBranches.map((b) => ({ label: b.name, value: b.code })),
            {
              label: '',
              value: (
                <button
                  type="button"
                  onClick={() => onAddBranch(row)}
                  className="text-[12px] font-semibold text-[var(--brand-accent-d)] hover:underline"
                >
                  + Add branch
                </button>
              ),
            },
          ],
        },
      ],
    }),
  }
}
