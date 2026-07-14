import type { Product } from '../types'

export const products: Product[] = [
  { id: 'p1', code: 'AMX-500', name: 'Amoxicillin 500mg Capsules', cat: 'Antibiotics', base: 'EA', purch: 'BOX', sale: 'EA', track: 'BATCH', sup: 's1' },
  { id: 'p2', code: 'CEF-1G', name: 'Ceftriaxone 1g Injection', cat: 'Antibiotics', base: 'VIAL', purch: 'CASE', sale: 'VIAL', track: 'BATCH', sup: 's1' },
  { id: 'p3', code: 'PARA-500', name: 'Paracetamol 500mg Tablets', cat: 'Analgesics', base: 'EA', purch: 'BOX', sale: 'EA', track: 'BATCH', sup: 's2' },
  { id: 'p4', code: 'IBU-400', name: 'Ibuprofen 400mg Tablets', cat: 'Analgesics', base: 'EA', purch: 'BOX', sale: 'EA', track: 'BATCH', sup: 's2' },
  { id: 'p5', code: 'INFV-Q', name: 'Influenza Vaccine QIV', cat: 'Vaccines', base: 'VIAL', purch: 'CASE', sale: 'VIAL', track: 'BATCH', sup: 's3' },
  { id: 'p6', code: 'COV-MR', name: 'COVID-19 mRNA Vaccine', cat: 'Vaccines', base: 'VIAL', purch: 'CASE', sale: 'VIAL', track: 'BATCH', sup: 's3' },
  { id: 'p7', code: 'INSUL-G', name: 'Insulin Glargine Pen', cat: 'Injectables', base: 'EA', purch: 'BOX', sale: 'EA', track: 'BATCH', sup: 's3' },
  { id: 'p8', code: 'SUT-30', name: 'Surgical Suture Kit 3-0', cat: 'Surgical', base: 'EA', purch: 'BOX', sale: 'EA', track: 'NONE', sup: 's4' },
  { id: 'p9', code: 'GLV-M', name: 'Nitrile Gloves — Medium', cat: 'Consumables', base: 'BOX', purch: 'CASE', sale: 'BOX', track: 'NONE', sup: 's4' },
  { id: 'p10', code: 'SYR-5', name: 'Syringe 5ml Luer-Lock', cat: 'Consumables', base: 'EA', purch: 'CASE', sale: 'PACK', track: 'NONE', sup: 's4' },
  { id: 'p11', code: 'ALCO-70', name: 'Alcohol Prep Swabs 70%', cat: 'Consumables', base: 'BOX', purch: 'CASE', sale: 'BOX', track: 'NONE', sup: 's4' },
  { id: 'p12', code: 'BPM-01', name: 'Digital BP Monitor', cat: 'Diagnostics', base: 'EA', purch: 'EA', sale: 'EA', track: 'SERIAL', sup: 's5' },
  { id: 'p13', code: 'PULSOX', name: 'Fingertip Pulse Oximeter', cat: 'Diagnostics', base: 'EA', purch: 'EA', sale: 'EA', track: 'SERIAL', sup: 's5' },
  { id: 'p14', code: 'THERM-IR', name: 'Infrared Thermometer', cat: 'Diagnostics', base: 'EA', purch: 'EA', sale: 'EA', track: 'SERIAL', sup: 's5' },
]
