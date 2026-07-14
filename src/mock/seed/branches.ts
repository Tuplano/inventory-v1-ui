import type { Branch } from '../types'

export const branches: Branch[] = [
  { id: 'b1', companyId: 'c1', name: 'Central DC — Chicago', code: 'CHI-01', address: '2200 W Cermak Rd, Chicago IL', active: true },
  { id: 'b2', companyId: 'c1', name: 'East Hub — Newark', code: 'EWR-02', address: '88 Doremus Ave, Newark NJ', active: true },
  { id: 'b3', companyId: 'c1', name: 'West Hub — Reno', code: 'RNO-03', address: '1400 Kleppe Ln, Sparks NV', active: true },
  { id: 'b4', companyId: 'c2', name: 'Oslo Depot', code: 'OSL-01', address: 'Karihaugveien 89, Oslo', active: true },
  { id: 'b5', companyId: 'c2', name: 'Bergen Depot', code: 'BGO-02', address: 'Kokstadflaten 5, Bergen', active: false },
]
