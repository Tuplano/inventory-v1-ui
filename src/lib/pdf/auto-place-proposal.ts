import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import type { ProposeAutoPlaceResult } from '@/hooks/mutations/use-propose-auto-place'

// Put-away worksheet for warehouse staff — a suggestion, not a record. Nothing here has been
// written to the system yet; every serial number is listed in full (no truncation) since staff
// need to match units to bins by hand, and actual placement still has to be recorded separately
// (via Transfer stock) once the units are physically in their bins.
export function downloadAutoPlaceProposal(locationName: string, result: ProposeAutoPlaceResult) {
  const doc = new jsPDF({ orientation: 'landscape' })
  const now = new Date()

  doc.setFontSize(14)
  doc.text('Auto-place proposal', 14, 16)
  doc.setFontSize(10)
  doc.setTextColor(120)
  doc.text(`From ${locationName} · ${now.toLocaleString()}`, 14, 22)
  doc.text('Suggested destinations only — not yet recorded. Confirm each move with Transfer stock after placing.', 14, 27)

  let cursorY = 33

  if (result.proposed.length > 0) {
    autoTable(doc, {
      startY: cursorY,
      head: [['Product name', 'SKU', 'Qty', 'Suggested storage', 'Storage position', 'Receiving # / Serials']],
      body: result.proposed.map((l) => [
        l.productName,
        l.productSku,
        l.quantityProposed.toLocaleString(),
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
    doc.text('No bin had room for these — needs a manual decision', 14, cursorY)
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
  doc.save(`auto-place-proposal-${slug}-${now.toISOString().slice(0, 10)}.pdf`)
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
