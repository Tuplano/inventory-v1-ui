import type { Company } from '../types'

export const companies: Company[] = [
  {
    id: 'c1',
    name: 'Meridian Health Distribution',
    code: 'MHD',
    color: 'var(--brand-accent)',
    legal: 'Meridian Health Distribution LLC',
    tax: 'US-84-2201933',
    email: 'ops@meridianhealth.co',
    active: true,
  },
  {
    id: 'c2',
    name: 'Nordic Medical Supply',
    code: 'NMS',
    color: 'var(--teal)',
    legal: 'Nordic Medical Supply AS',
    tax: 'NO-998-221-114',
    email: 'post@nordicmed.no',
    active: true,
  },
]
