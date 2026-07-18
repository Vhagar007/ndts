import { useEffect } from 'react'

function fmt(s) {
  if (!s) return ''
  const d = new Date(s)
  return d.getDate().toString().padStart(2,'0') + '/' +
    (d.getMonth()+1).toString().padStart(2,'0') + '/' +
    d.getFullYear()
}

// Each field: { text, x, y } in mm from top-left of slip
// Slip is 297mm wide x 210mm tall (A4 landscape)
// Two slips stacked = A4 portrait (210mm wide x 297mm tall)
// BUT we print portrait, so each slip is 210mm wide x 148mm tall

function getFields(lr) {
  const office = (lr.office || '').toUpperCase()
  return [
    // LR Number - top right, inside the box
    { text: lr.lr_number, x: 167, y: 8, bold: true, size: 11 },

    // Row 1: Truck No (blank), From (office), To (Ahmedabad), Date
    { text: office,          x: 82,  y: 37.5, bold: true, size: 7, color: '#cc0000' },
    { text: 'AHMEDABAD',     x: 120, y: 37.5, bold: true, size: 7 },
    { text: fmt(lr.date),    x: 166, y: 37.5, bold: false, size: 7 },

    // Row 2: Consignor, Consignee
    { text: lr.consignor || '',  x: 42,  y: 43.5, bold: true, size: 7 },
    { text: lr.consignee || '',  x: 122, y: 43.5, bold: true, size: 7 },

    // Row 3: GST numbers
    { text: lr.consignor_gst || '', x: 42,  y: 49.5, bold: false, size: 6.5 },
    { text: lr.consignee_gst || '', x: 122, y: 49.5, bold: false, size: 6.5 },

    // Table row: Article, Particulars, KG, Amount Rs, Amount Ps, To Pay
    { text: lr.articles || '',    x: 44,  y: 61, bold: true, size: 7, align: 'center', width: 11 },
    { text: lr.particulars || '', x: 58,  y: 61, bold: true, size: 7 },
    { text: lr.weight_kg ? String(lr.weight_kg) : '', x: 147, y: 61, bold: true, size: 7, align: 'center', width: 13 },

    // Amount
    ...(lr.payment_type === 'paid' && lr.amount ? [
      { text: String(Math.floor(lr.amount)), x: 162, y: 61, bold: true, size: 7, align: 'right', width: 12 },
      { text: '00',                           x: 175, y: 61, bold: true, size: 7, align: 'center', width: 8 },
    ] : []),

    // To Pay
    ...(lr.payment_type === 'topay' && lr.amount ? [
      { text: String(lr.amount), x: 184, y: 61, bold: true, size: 7, align: 'center', width: 12 },
    ] : []),
  ]
}

function fieldCSS(f) {
  const align = f.align || 'left'
  const width = f.width ? `width:${f.width}mm;` : ''
  const color = f.color ? `color:${f.color};` : ''
  const weight = f.bold ? 'font-weight:700;' : ''
  const size = f.size ? `font-size:${f.size}pt;` : 'font-size:7pt;'
  return `position:absolute;left:${f.x}mm;top:${f.y}mm;${width}text-align:${align};${weight}${size}${color}font-family:Arial,sans-serif;white-space:nowrap;`
}

function buildHTML(lr) {
  const fields = getFields(lr)

  // Build field divs for one slip
  const fieldDivs = fields.map(f =>
    `<div style="${fieldCSS(f)}">${f.text}</div>`
  ).join('\n')

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>LR ${lr.lr_number}</title>
<style>
  @page { size: A4 portrait; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: white; font-family: Arial, sans-serif; }
  .page { width: 210mm; height: 297mm; position: relative; overflow: hidden; }
  .slip { width: 210mm; height: 148.5mm; position: relative; overflow: hidden; }
</style>
</head>
<body>
<div class="page">
  <!-- SLIP 1: top half -->
  <div class="slip" style="top:0;left:0;position:absolute;">
    ${fieldDivs}
  </div>
  <!-- SLIP 2: bottom half -->
  <div class="slip" style="top:148.5mm;left:0;position:absolute;">
    ${fieldDivs}
  </div>
</div>
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
