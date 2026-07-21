import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import type { AutoPlaceResult } from '@/hooks/mutations/use-auto-place-location'

// Put-away receipt for warehouse staff to physically arrange stock — every serial number is
// listed in full (no truncation) since staff need to match units to bins by hand.
export function downloadAutoPlaceReceipt(locationName: string, result: AutoPlaceResult) {
  const doc = new jsPDF({ orientation: 'landscape' })
  const now = new Date()

  doc.setFontSize(14)
  doc.text('Auto-place receipt', 14, 16)
  doc.setFontSize(10)
  doc.setTextColor(120)
  doc.text(`From ${locationName} · ${now.toLocaleString()}`, 14, 22)

  let cursorY = 28

  if (result.placed.length > 0) {
    autoTable(doc, {
      startY: cursorY,
      head: [['Product name', 'SKU', 'Qty', 'Storage name', 'Storage position', 'Receiving # / Serials']],
      body: result.placed.map((l) => [
        l.productName,
        l.productSku,
        l.quantityPlaced.toLocaleString(),
        l.toLocationName,
        l.toLocationPosition ?? '—',
        formatTraceColumn(l.receivingNumber, l.serialNumbers),
      ]),
      styles: { fontSize: 9, overflow: 'linebreak' },
      headStyles: { fillColor: [30, 41, 59] },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 28 },
        2: { cellWidth: 16 },
        3: { cellWidth: 32 },
        4: { cellWidth: 32 },
        5: { cellWidth: 'auto' },
      },
    })
    cursorY = getFinalY(doc, cursorY) + 10
  }

  if (result.unplaced.length > 0) {
    doc.setFontSize(11)
    doc.setTextColor(180, 60, 20)
    doc.text('Could not be placed (no bin had room)', 14, cursorY)
    cursorY += 4

    autoTable(doc, {
      startY: cursorY,
      head: [['Product name', 'SKU', 'Qty remaining', 'Receiving # / Serials']],
      body: result.unplaced.map((l) => [
        l.productName,
        l.productSku,
        l.quantityRemaining.toLocaleString(),
        formatTraceColumn(l.receivingNumber, l.serialNumbers),
      ]),
      styles: { fontSize: 9, overflow: 'linebreak' },
      headStyles: { fillColor: [153, 27, 27] },
    })
  }

  const slug = locationName.toLowerCase().trim().replace(/\s+/g, '-')
  doc.save(`auto-place-${slug}-${now.toISOString().slice(0, 10)}.pdf`)
}

function getFinalY(doc: jsPDF, fallback: number): number {
  const lastAutoTable = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
  return lastAutoTable?.finalY ?? fallback
}

function formatTraceColumn(receivingNumber: string | null, serialNumbers?: string[]): string {
  if (serialNumbers && serialNumbers.length > 0) {
    return serialNumbers.join(', ')
  }
  return receivingNumber ?? '—'
}
