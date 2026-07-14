import type { Supplier } from '../types'

export const suppliers: Supplier[] = [
  { id: 's1', code: 'SUP-ACME', name: 'Acme Pharma Wholesale', contact: 'M. Ito', email: 'sales@acmepharma.com', phone: '+1 312 555 0110', address: '410 Industrial Dr, Aurora IL', active: true },
  { id: 's2', code: 'SUP-BAYL', name: 'Bayline Generics', contact: 'R. Osei', email: 'orders@bayline.com', phone: '+1 973 555 0144', address: '22 Harbor Blvd, Elizabeth NJ', active: true },
  { id: 's3', code: 'SUP-IMMU', name: 'ImmunoCore Biologics', contact: 'S. Petrov', email: 'supply@immunocore.com', phone: '+1 800 555 0199', address: '900 Bio Park Way, Cambridge MA', active: true },
  { id: 's4', code: 'SUP-MEDX', name: 'MedXpress Consumables', contact: 'L. Nguyen', email: 'csr@medxpress.com', phone: '+1 702 555 0121', address: '5511 Sunset Rd, Las Vegas NV', active: true },
  { id: 's5', code: 'SUP-DIAG', name: 'DiagnosTech Instruments', contact: 'A. Bauer', email: 'b2b@diagnostech.com', phone: '+49 30 555 220', address: 'Messedamm 12, Berlin', active: false },
]
