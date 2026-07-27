import { useEffect } from 'react'

function fmt(s) {
  if (!s) return ''
  const d = new Date(s)
  return d.getDate().toString().padStart(2,'0') + '/' +
    (d.getMonth()+1).toString().padStart(2,'0') + '/' +
    d.getFullYear()
}

// All coordinates from Canva dimensions Excel sheet
// X/Y = top-left of element, Width/Height = element size
// Page: 21cm x 29.7cm portrait (both slips on one A4)

function el(text, x, y, w, h, size, color, align='left') {
  return `<div style="position:absolute;left:${x}cm;top:${y}cm;width:${w}cm;height:${h}cm;font-size:${size}pt;color:${color};font-family:Arial,Helvetica,sans-serif;font-weight:700;text-align:${align};overflow:hidden;line-height:1.1;display:flex;align-items:center;">${text}</div>`
}

function buildHTML(lr) {
  const mag = '#db2498'
  const blk = '#000000'

  const to   = 'AHMEDABAD'
  const date = fmt(lr.date)
  const cons = lr.consignor || ''
  const cnse = lr.consignee || ''
  const cgst = lr.consignor_gst || ''
  const ngst = lr.consignee_gst || ''
  const art  = lr.articles || ''
  const part = lr.particulars || ''
  const kg   = lr.weight_kg ? String(lr.weight_kg) : ''
  const amt  = lr.amount ? String(lr.amount) : ''
  const lrno = lr.lr_number || ''

  // To Pay value prints in BOTH Amount and To Pay columns
  const topay = lr.amount ? String(lr.amount) : ''
  const amtVal = lr.amount ? String(lr.amount) : ''

  // ── 1ST COPY ──────────────────────────────────────────────
  const s1 = [
    el(lrno, 16.44, 1.85,  2.44, 0.91, 20, blk, 'center'),
    el(to,   12.89, 4.21,  2.05, 0.41,  9, mag),
    el(date, 17.47, 4.21,  2.05, 0.41,  9, mag),
    el(cons,  7.20, 4.82,  4.82, 0.83,  9, mag),
    el(cnse, 14.66, 4.82,  4.82, 0.83,  9, mag),
    el(cgst,  6.42, 5.86,  2.94, 0.41,  9, mag),
    el(ngst, 13.92, 5.86,  2.94, 0.41,  9, mag),
    el(art,   5.23, 8.64,  0.91, 0.67, 15, blk, 'center'),
    el(part,  6.42, 8.09,  7.49, 1.82, 20, blk),
    el(kg,   14.06, 8.64,  1.52, 0.67, 15, blk, 'center'),
    el(amtVal,16.70,7.76,  1.52, 0.67, 15, blk, 'center'),
    el(topay,18.72, 9.47,  1.52, 0.67, 15, blk, 'center'),
  ].join('\n')

  // ── 2ND COPY ──────────────────────────────────────────────
  const s2 = [
    el(lrno, 16.44, 16.71, 2.35, 0.84, 20, blk, 'center'),
    el(to,   12.89, 19.05, 2.05, 0.41,  9, mag),
    el(date, 17.47, 19.05, 2.05, 0.41,  9, mag),
    el(cons,  7.20, 19.69, 4.82, 0.83,  9, mag),
    el(cnse, 14.66, 19.69, 4.82, 0.83,  9, mag),
    el(cgst,  6.42, 20.70, 2.94, 0.41,  9, mag),
    el(ngst, 13.92, 20.70, 2.94, 0.41,  9, mag),
    el(art,   5.23, 23.55, 0.91, 0.67, 15, blk, 'center'),
    el(part,  6.42, 22.97, 7.49, 1.82, 20, blk),
    el(kg,   14.06, 23.55, 1.52, 0.67, 15, blk, 'center'),
    el(amtVal,16.70,22.64, 1.52, 0.67, 15, blk, 'center'),
    el(topay,18.72, 24.30, 1.52, 0.67, 15, blk, 'center'),
  ].join('\n')

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>LR ${lrno}</title>
<style>
  @page { size: 21cm 29.7cm; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: white; width: 21cm; height: 29.7cm; position: relative; overflow: hidden; }
</style>
</head>
<body>
${s1}
${s2}
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
