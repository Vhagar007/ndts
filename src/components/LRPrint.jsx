import { useEffect } from 'react'

function fmt(s) {
  if (!s) return ''
  const d = new Date(s)
  return d.getDate().toString().padStart(2,'0') + '/' +
    (d.getMonth()+1).toString().padStart(2,'0') + '/' +
    d.getFullYear()
}

// All measurements from LR_Dimensions.xlsx — exact Canva coordinates
// X/Y = top-left of element in cm from top-left of A4 page
function el(text, x, y, w, h, size, color, align='left') {
  return `<div style="
    position:absolute;
    left:${x}cm;
    top:${y}cm;
    width:${w}cm;
    height:${h}cm;
    font-size:${size}pt;
    color:${color};
    font-family:Arial,Helvetica,sans-serif;
    font-weight:700;
    text-align:${align};
    overflow:hidden;
    line-height:1.1;
    display:flex;
    align-items:center;
  ">${text}</div>`
}

function buildHTML(lr) {
  const M = '#db2498'   // Magenta
  const B = '#000000'   // Black

  const lrno = lr.lr_number || ''
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

  // ── 1ST COPY (exact from Excel) ──
  const s1 = [
    el(lrno, 16.44, 1.85,  2.44, 0.91, 20, B, 'center'),
    el(to,   12.89, 4.21,  2.05, 0.41,  9, M),
    el(date, 17.47, 4.21,  2.05, 0.41,  9, M),
    el(cons,  7.20, 4.82,  4.82, 0.83,  9, M),
    el(cnse, 14.66, 4.82,  4.82, 0.83,  9, M),
    el(cgst,  6.42, 5.86,  2.94, 0.41,  9, M),
    el(ngst, 13.92, 5.86,  2.94, 0.41,  9, M),
    el(art,   5.23, 8.64,  0.91, 0.67, 15, B, 'center'),
    el(part,  6.42, 8.09,  7.49, 1.82, 20, B),
    el(kg,   14.06, 8.64,  1.52, 0.67, 15, B, 'center'),
    el(amt,  16.70, 7.76,  1.52, 0.67, 15, B, 'center'),
    el(amt,  18.72, 9.47,  1.52, 0.67, 15, B, 'center'),
  ].join('')

  // ── 2ND COPY (exact from Excel) ──
  const s2 = [
    el(lrno, 16.44, 16.71, 2.35, 0.84, 20, B, 'center'),
    el(to,   12.89, 19.05, 2.05, 0.41,  9, M),
    el(date, 17.47, 19.05, 2.05, 0.41,  9, M),
    el(cons,  7.20, 19.69, 4.82, 0.83,  9, M),
    el(cnse, 14.66, 19.69, 4.82, 0.83,  9, M),
    el(cgst,  6.42, 20.70, 2.94, 0.41,  9, M),
    el(ngst, 13.92, 20.70, 2.94, 0.41,  9, M),
    el(art,   5.23, 23.55, 0.91, 0.67, 15, B, 'center'),
    el(part,  6.42, 22.97, 7.49, 1.82, 20, B),
    el(kg,   14.06, 23.55, 1.52, 0.67, 15, B, 'center'),
    el(amt,  16.70, 22.64, 1.52, 0.67, 15, B, 'center'),
    el(amt,  18.72, 24.30, 1.52, 0.67, 15, B, 'center'),
  ].join('')

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>LR ${lrno}</title>
<style>
  /* Force exact A4 portrait with zero margins — critical for alignment */
  @page {
    size: 210mm 297mm;
    margin: 0;
    padding: 0;
  }
  html, body {
    margin: 0;
    padding: 0;
    width: 210mm;
    height: 297mm;
    overflow: hidden;
    background: white;
  }
  * {
    box-sizing: border-box;
  }
  .page {
    position: relative;
    width: 210mm;
    height: 297mm;
    overflow: hidden;
    background: white;
  }
</style>
</head>
<body>
<div class="page">
${s1}
${s2}
</div>
<script>
  // Tell browser not to scale — must be 100%
  window.onload = function() {
    document.title = 'LR ${lrno}';
  };
</script>
</body>
</html>`
}

export default function LRPrint({ lr, onDone }) {
  useEffect(() => {
    const html = buildHTML(lr)
    const w = window.open('', '_blank', 'width=850,height=1100')
    if (w) {
      w.document.write(html)
      w.document.close()
      w.focus()
      setTimeout(() => {
        w.print()
        // Don't close immediately — let user confirm print dialog
        setTimeout(() => {
          w.close()
          onDone?.()
        }, 2000)
      }, 800)
    } else {
      onDone?.()
    }
  }, [])
  return null
}
