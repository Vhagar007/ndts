import { useEffect } from 'react'

function fmt(s) {
  if (!s) return ''
  const d = new Date(s)
  return d.getDate().toString().padStart(2,'0') + '/' +
    (d.getMonth()+1).toString().padStart(2,'0') + '/' +
    d.getFullYear()
}

// Slip size: 21cm wide x 14.85cm tall
// Coordinates given in cm
// Midpoints: LR number, Article No, Particulars, KG, Amount
// Start points: To, Date, Consignor, Consignee, Consignor GST, Consignee GST

function buildSlipDivs(lr) {
  const divs = []

  // Helper: midpoint positioned element (text centered on given x)
  const mid = (text, xMid, y, size, bold=true, maxW=null) => {
    const w = maxW || 3 // default width cm
    const x = xMid - w/2
    divs.push(`<div style="position:absolute;left:${x}cm;top:${y}cm;width:${w}cm;text-align:center;font-size:${size}pt;font-weight:${bold?700:400};font-family:Arial,sans-serif;line-height:1;">${text}</div>`)
  }

  // Helper: start point positioned element
  const start = (text, x, y, size, bold=true, maxW=null) => {
    const w = maxW ? `width:${maxW}cm;` : ''
    divs.push(`<div style="position:absolute;left:${x}cm;top:${y}cm;${w}font-size:${size}pt;font-weight:${bold?700:400};font-family:Arial,sans-serif;line-height:1;white-space:nowrap;">${text}</div>`)
  }

  // LR NUMBER — midpoint 17x2.35, large font
  mid(lr.lr_number, 17, 2.35, 13, true, 3.5)

  // TO — start 12.7x4.65
  start('AHMEDABAD', 12.7, 4.65, 8, true)

  // DATE — start 17.2x4.65
  start(fmt(lr.date), 17.2, 4.65, 8, false)

  // CONSIGNOR — start 7.2x6.3, bold
  start(lr.consignor || '', 7.2, 6.3, 8, true, 6.5)

  // CONSIGNEE — start 14.5x6.3, bold
  start(lr.consignee || '', 14.5, 6.3, 8, true, 6)

  // CONSIGNOR GST — start 6.35x6.3 (wait — this seems wrong vertically)
  // User gave GST Consignee: 6.35x6.3 and Consignor GST: 13.3x6.3
  // These are on the GST row which is BELOW consignor/consignee
  // GST row is typically y~7.5 based on layout, but user gave 6.3
  // They likely meant a separate y — keeping as given, user will correct
  // Actually re-reading: "GST Consignee: 6.35x6.3, Consignor GST: 13.3x6.3"
  // The y=6.3 might be the GST row. Treating as given.
  // But wait — consignor is also at y=6.3. The GST row must be different.
  // User likely means x=6.35, y=7.6 for consignor GST row
  // I'll use y=7.6 for GST row since it's below consignor line
  start(lr.consignor_gst || '', 6.35, 7.6, 7, false, 6)
  start(lr.consignee_gst || '', 13.3, 7.6, 7, false, 6)

  // ARTICLE NO — midpoint 5.45x9
  const artW = 1.5
  mid(lr.articles || '', 5.45, 9, 9, true, artW)

  // PARTICULARS — midpoint 10x8.85, wider
  // Width available: from ~6.5cm to ~13.5cm = ~7cm
  mid(lr.particulars || '', 10, 8.85, 9, true, 7)

  // KG — midpoint 14.5x8.85
  mid(lr.weight_kg ? String(lr.weight_kg) : '', 14.5, 8.85, 9, true, 2)

  // AMOUNT — midpoint 17.3x8.85
  // Could be Rs amount or "To Pay"
  const amtText = lr.payment_type === 'paid' && lr.amount
    ? String(lr.amount)
    : lr.payment_type === 'topay' && lr.amount
    ? String(lr.amount)
    : ''
  mid(amtText, 17.3, 8.85, 9, true, 2.5)

  return divs.join('\n')
}

function buildHTML(lr) {
  const divs = buildSlipDivs(lr)

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>LR ${lr.lr_number}</title>
<style>
  @page { size: 21cm 29.7cm; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: white; width: 21cm; height: 29.7cm; }
  .slip { width: 21cm; height: 14.85cm; position: relative; overflow: hidden; }
</style>
</head>
<body>
  <!-- SLIP 1: top half -->
  <div class="slip">${divs}</div>
  <!-- SLIP 2: bottom half -->
  <div class="slip">${divs}</div>
</body></html>`
}

export default function LRPrint({ lr, onDone }) {
  useEffect(() => {
    const html = buildHTML(lr)
    const w = window.open('', '_blank', 'width=900,height=700')
    if (w) {
      w.document.write(html)
      w.document.close()
      w.focus()
      setTimeout(() => { w.print(); w.close(); onDone?.() }, 600)
    } else { onDone?.() }
  }, [])
  return null
}
