import type { AppUser } from '../types'

export const users: AppUser[] = [
  { id: 'us1', name: 'Dana Reyes', email: 'd.reyes@meridianhealth.co', gRole: 'ADMIN', companyRole: 'Company Admin', allBranches: true, branches: 3, status: 'Active', last: '2026-07-13' },
  { id: 'us2', name: 'Marcus Webb', email: 'm.webb@meridianhealth.co', gRole: 'MANAGER', companyRole: 'Warehouse Manager', allBranches: false, branches: 1, status: 'Active', last: '2026-07-13' },
  { id: 'us3', name: 'Priya Anand', email: 'p.anand@meridianhealth.co', gRole: 'STAFF', companyRole: 'Buyer', allBranches: true, branches: 3, status: 'Active', last: '2026-07-12' },
  { id: 'us4', name: 'Tom Okafor', email: 't.okafor@meridianhealth.co', gRole: 'STAFF', companyRole: 'Receiving Clerk', allBranches: false, branches: 2, status: 'Active', last: '2026-07-11' },
  { id: 'us5', name: 'Lena Ford', email: 'l.ford@meridianhealth.co', gRole: 'VIEWER', companyRole: 'Read Only', allBranches: false, branches: 1, status: 'Invited', last: '—' },
  { id: 'us6', name: 'Sven Halvorsen', email: 's.halvorsen@nordicmed.no', gRole: 'ADMIN', companyRole: 'Company Admin', allBranches: true, branches: 2, status: 'Active', last: '2026-07-10' },
]
