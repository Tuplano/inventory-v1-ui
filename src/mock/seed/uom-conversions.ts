import type { UomConversion } from '../types'

export const conversions: UomConversion[] = [
  { id: 'cv1', from: 'BOX', to: 'EA', factor: 100 },
  { id: 'cv2', from: 'CASE', to: 'VIAL', factor: 24 },
  { id: 'cv3', from: 'CASE', to: 'BOX', factor: 12 },
  { id: 'cv4', from: 'PACK', to: 'EA', factor: 10 },
  { id: 'cv5', from: 'BOX', to: 'EA', factor: 500 },
  { id: 'cv6', from: 'CASE', to: 'VIAL', factor: 50 },
]
