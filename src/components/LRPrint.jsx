import { useEffect } from 'react'

function fmt(s) {
  if (!s) return ''
  const d = new Date(s)
  return d.getDate().toString().padStart(2,'0') + '/' +
    (d.getMonth()+1).toString().padStart(2,'0') + '/' +
    d.getFullYear()
}

// Overlay printer — prints ONLY variable data on blank page
// Pre-printed LR is already in the printer
// Page orientation: LANDSCAPE (297mm wide x 210mm tall per slip)
// Two slips per A3 sheet OR print each separately on A4 landscape

function getFields(lr) {
  return [
    // LR NUMBER — large, below BHAYANDER mob number, 3.2cm right of Diamond
    { text: lr.lr_number,            x: 164, y: 20.5, size: 14, bold: true },

    // ROW 1: To (destination) + Date — From/BHAYANDER is pre-printed
    { text: 'AHMEDABAD',             x: 120, y: 47.4, size: 8,  bold: true },
    { text: fmt(lr.date),            x: 207, y: 47.4, size: 8,  bold: false },

    // ROW 2: Consignor + Consignee — bold
    { text: lr.consignor || '',      x: 55,  y: 53.8, size: 8,  bold: true },
    { text: lr.consignee || '',      x: 150, y: 53.8, size: 8,  bold: true },

    // ROW 3: GST numbers
    { text: lr.consignor_gst || '',  x: 45,  y: 60.1, size: 7,  bold: false },
    { text: lr.consignee_gst || '',  x: 143, y: 60.1, size: 7,  bold: false },

    // TABLE: Article No, Particulars (large), KG, Amount, To Pay
    { text: lr.articles || '',       x: 45,  y: 70,   size: 9,  bold: true,  align: 'center', width: 12 },
    { text: lr.particulars || '',    x: 62,  y: 70,   size: 9,  bold: true },
    { text: lr.weight_kg ? String(lr.weight_kg) : '', x: 176, y: 70, size: 9, bold: true, align: 'center', width: 14 },

    // Amount
    ...(lr.payment_type === 'paid' && lr.amount ? [
      { text: String(Math.floor(lr.amount)), x: 196, y: 70, size: 9, bold: true, align: 'right', width: 13 },
      { text: '00',                           x: 210, y: 70, size: 9, bold: true, align: 'center', width: 9 },
    ] : []),

    // To Pay
    ...(lr.payment_type === 'topay' && lr.amount ? [
      { text: String(lr.amount),     x: 222, y: 70,   size: 9,  bold: true, align: 'center', width: 14 },
    ] : []),
  ]
}

function fieldStyle(f) {
  return [
    `position:absolute`,
    `left:${f.x}mm`,
    `top:${f.y}mm`,
    f.width ? `width:${f.width}mm` : '',
    `text-align:${f.align || 'left'}`,
    `font-weight:${f.bold ? '700' : '400'}`,
    `font-size:${f.size || 7}pt`,
    f.color ? `color:${f.color}` : '',
    `font-family:Arial,sans-serif`,
    `white-space:nowrap`,
    `line-height:1`,
  ].filter(Boolean).join(';')
}

function buildHTML(lr) {
  const divs = getFields(lr)
    .map(f => `<div style="${fieldStyle(f)}">${f.text}</div>`)
    .join('\n')

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>LR ${lr.lr_number}</title>
<style>
  @page { size: A4 landscape; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: white; }
  .page { width: 297mm; height: 210mm; position: relative; overflow: hidden; }
  .slip { width: 297mm; height: 105mm; position: absolute; overflow: hidden; }
</style>
</head>
<body>
<div class="page">
  <div class="slip" style="top:0mm;">
    ${divs}
  </div>
  <div class="slip" style="top:105mm;">
    ${divs}
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
