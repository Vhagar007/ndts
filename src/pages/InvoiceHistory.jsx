import { useState } from 'react'
import { supabase, fmtDate } from '../lib/supabase'

function buildInvoiceHTML(invoice, lrs) {
  const totalArticles = lrs.reduce((s, l) => s + (parseInt(l.articles) || 0), 0)
  const totalWeight = lrs.reduce((s, l) => s + (parseFloat(l.weight_kg) || 0), 0)

  const rows = lrs.map(l => `
    <tr>
      <td style="border:0.5px solid #000;padding:3px 5px;font-size:8pt">${l.lr_number}</td>
      <td style="border:0.5px solid #000;padding:3px 5px;font-size:8pt;text-align:center">${l.articles || '—'}</td>
      <td style="border:0.5px solid #000;padding:3px 5px;font-size:8pt">${l.particulars || '—'}</td>
      <td style="border:0.5px solid #000;padding:3px 5px;font-size:8pt">${l.consignee}</td>
      <td style="border:0.5px solid #000;padding:3px 5px;font-size:8pt;text-align:center">${l.weight_kg || '—'}</td>
      <td style="border:0.5px solid #000;padding:3px 5px;font-size:8pt;text-align:center">${l.payment_type === 'topay' ? (l.amount || 'To Pay') : (l.amount ? 'Rs.' + Number(l.amount).toLocaleString('en-IN') : '—')}</td>
      <td style="border:0.5px solid #000;padding:3px 5px;font-size:8pt"></td>
    </tr>
  `).join('')

  // Add blank rows to fill page
  const blankRows = Math.max(0, 15 - lrs.length)
  const blanks = Array(blankRows).fill(`
    <tr>
      <td style="border:0.5px solid #000;padding:3px 5px;height:18px">&nbsp;</td>
      <td style="border:0.5px solid #000;padding:3px 5px"></td>
      <td style="border:0.5px solid #000;padding:3px 5px"></td>
      <td style="border:0.5px solid #000;padding:3px 5px"></td>
      <td style="border:0.5px solid #000;padding:3px 5px"></td>
      <td style="border:0.5px solid #000;padding:3px 5px"></td>
      <td style="border:0.5px solid #000;padding:3px 5px"></td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Invoice #${invoice.invoice_number}</title>
<style>
  @page { size: A4 portrait; margin: 10mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 9pt; color: #000; background: white; }
  .header { text-align: center; margin-bottom: 6px; }
  .company-name { font-size: 16pt; font-weight: 700; }
  .company-sub { font-size: 8pt; color: #333; margin-top: 2px; }
  .meta-row { display: flex; gap: 12px; margin: 6px 0; font-size: 8.5pt; flex-wrap: wrap; }
  .meta-item { display: flex; align-items: baseline; gap: 4px; }
  .meta-label { font-weight: 700; white-space: nowrap; }
  .meta-val { border-bottom: 0.5px solid #000; min-width: 80px; padding: 0 3px; font-weight: 700; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th { border: 0.5px solid #000; padding: 4px 5px; font-size: 8pt; text-align: center; background: #f5f5f5; }
  .total-row td { font-weight: 700; font-size: 8.5pt; border: 0.5px solid #000; padding: 3px 5px; }
  .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 16px; font-size: 8pt; }
  .sign-box { border-top: 0.5px solid #000; min-width: 120px; text-align: center; padding-top: 4px; font-size: 7.5pt; }
</style>
</head>
<body>

<div class="header">
  <div class="company-name">New Diamond Transport Service</div>
  <div class="company-sub">H.O.: Old Lati Bazar, Opp. Satkar Guest House, B/H. S.T. Stand &nbsp;|&nbsp; M.: 7878548055, 9512614040</div>
</div>

<div class="meta-row">
  <div class="meta-item"><span class="meta-label">From</span><span class="meta-val">${invoice.office}</span></div>
  <div class="meta-item"><span class="meta-label">To</span><span class="meta-val">Ahmedabad</span></div>
  <div class="meta-item"><span class="meta-label">Truck No.</span><span class="meta-val">${invoice.truck_number}</span></div>
  <div class="meta-item"><span class="meta-label">Owner's Name</span><span class="meta-val"></span></div>
</div>
<div class="meta-row">
  <div class="meta-item"><span class="meta-label">Driver's Name</span><span class="meta-val">${invoice.driver_name || ''}</span></div>
  <div class="meta-item"><span class="meta-label">Lic. No.</span><span class="meta-val"></span></div>
  <div class="meta-item"><span class="meta-label">INVOICE No.</span><span class="meta-val" style="font-size:11pt;font-weight:700">${invoice.invoice_number}</span></div>
  <div class="meta-item"><span class="meta-label">Date</span><span class="meta-val">${fmtDate(invoice.departure_date)}</span></div>
</div>

<table>
  <thead>
    <tr>
      <th style="width:13%">L.R. No.</th>
      <th style="width:8%">Article</th>
      <th style="width:28%">Particulars</th>
      <th style="width:24%">Consignee</th>
      <th style="width:9%">Weight</th>
      <th style="width:12%">To Pay</th>
      <th style="width:6%">Rem.</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
    ${blanks}
    <tr class="total-row">
      <td colspan="1" style="text-align:right">Total</td>
      <td style="text-align:center">${totalArticles}</td>
      <td></td>
      <td></td>
      <td style="text-align:center">${Math.round(totalWeight)} kg</td>
      <td></td>
      <td></td>
    </tr>
  </tbody>
</table>

<div class="footer">
  <div class="sign-box">Driver's Sign.</div>
  <div style="font-weight:700;font-size:9pt">FOR, NEW DIAMOND TRANSPORT SERVICE</div>
</div>

</body></html>`
}

export default function InvoiceHistory({ user }) {
  const [invoiceNo, setInvoiceNo] = useState('')
  const [invoice, setInvoice] = useState(null)
  const [lrs, setLrs] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  async function searchInvoice() {
    if (!invoiceNo.trim()) { setMsg('Enter an invoice number.'); return }
    setLoading(true); setMsg(null); setInvoice(null); setLrs([])

    // Search by invoice_number field
    let q = supabase.from('invoices').select('*').eq('invoice_number', invoiceNo.trim())
    // Office operators can only see their own office invoices
    if (user.role === 'office') q = q.eq('office', user.office)

    const { data: invData, error: invErr } = await q.single()
    if (invErr || !invData) {
      setMsg(`No invoice found for #${invoiceNo}.`)
      setLoading(false)
      return
    }

    // Get all LRs on this invoice
    const { data: lrData } = await supabase
      .from('lr_entries')
      .select('*')
      .eq('invoice_id', invData.id)
      .order('lr_number', { ascending: true })

    setInvoice(invData)
    setLrs(lrData || [])
    setLoading(false)
  }

  function handlePrint() {
    const html = buildInvoiceHTML(invoice, lrs)
    const w = window.open('', '_blank', 'width=850,height=1100')
    if (w) {
      w.document.write(html)
      w.document.close()
      w.focus()
      setTimeout(() => { w.print(); w.close() }, 600)
    }
  }

  const payLabel = { topay: 'To Pay', paid: 'Paid', blank: '—' }
  const totalWeight = lrs.reduce((s, l) => s + (parseFloat(l.weight_kg) || 0), 0)
  const totalArticles = lrs.reduce((s, l) => s + (parseInt(l.articles) || 0), 0)

  return (
    <div className="page">
      <div style={{ marginBottom: '1rem' }}>
        <h1 style={{ fontSize: 20, fontWeight: 500 }}>Invoice history</h1>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 3 }}>Search any past invoice by number</p>
      </div>

      <div className="card">
        <p className="sec-title">Search invoice</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={invoiceNo}
            onChange={e => setInvoiceNo(e.target.value)}
            placeholder="Enter invoice number e.g. 555"
            onKeyDown={e => e.key === 'Enter' && searchInvoice()}
            style={{ flex: 1 }}
          />
          <button className="btn btn-blue" onClick={searchInvoice} disabled={loading}>
            {loading ? 'Searching...' : '🔍 Search'}
          </button>
        </div>
        {msg && <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 8 }}>{msg}</p>}
      </div>

      {invoice && (
        <div className="card" style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 16, fontWeight: 600 }}>Invoice #{invoice.invoice_number}</p>
              <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 3 }}>
                {invoice.office} → Ahmedabad &nbsp;·&nbsp; {invoice.truck_number} &nbsp;·&nbsp; {fmtDate(invoice.departure_date)}
                {invoice.driver_name && ` · ${invoice.driver_name}`}
                {invoice.book_series && ` · Book ${invoice.book_series}`}
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              🖨 Reprint invoice
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
            <div className="metric">
              <div className="metric-label">Total LRs</div>
              <div className="metric-val">{lrs.length}</div>
            </div>
            <div className="metric">
              <div className="metric-label">Total articles</div>
              <div className="metric-val">{totalArticles}</div>
            </div>
            <div className="metric">
              <div className="metric-label">Total weight</div>
              <div className="metric-val">{Math.round(totalWeight)} kg</div>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>LR No.</th>
                  <th>Articles</th>
                  <th>Particulars</th>
                  <th>Consignee</th>
                  <th>Weight (kg)</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {lrs.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text2)', padding: '1rem' }}>No LRs found for this invoice.</td></tr>
                )}
                {lrs.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 500 }}>{l.lr_number}</td>
                    <td style={{ textAlign: 'center' }}>{l.articles || '—'}</td>
                    <td>{l.particulars || '—'}</td>
                    <td>{l.consignee}</td>
                    <td style={{ textAlign: 'center' }}>{l.weight_kg || '—'}</td>
                    <td>{payLabel[l.payment_type]}{l.amount ? ` · Rs.${Number(l.amount).toLocaleString('en-IN')}` : ''}</td>
                    <td>
                      <span className="badge" style={{
                        background: l.status === 'delivered' ? '#E1F5EE' : l.status === 'arrived' ? '#E1F5EE' : l.status === 'transit' ? '#FAEEDA' : '#E6F1FB',
                        color: l.status === 'delivered' ? '#0F6E56' : l.status === 'arrived' ? '#0F6E56' : l.status === 'transit' ? '#854F0B' : '#185FA5'
                      }}>
                        {l.status === 'delivered' ? 'Delivered' : l.status === 'arrived' ? 'Arrived' : l.status === 'transit' ? 'In transit' : 'Booked'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
