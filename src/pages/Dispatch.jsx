import { useState } from 'react'
import { supabase, OFFICES, fmtDate } from '../lib/supabase'

const today = () => new Date().toISOString().slice(0, 10)

export default function Dispatch() {
  const [office, setOffice] = useState('')
  const [truck, setTruck] = useState('')
  const [driver, setDriver] = useState('')
  const [date, setDate] = useState(today())
  const [pendingLRs, setPendingLRs] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(false)
  const [invoice, setInvoice] = useState(null)
  const [msg, setMsg] = useState(null)

  async function loadPending() {
    if (!office || !truck || !date) { setMsg({ type: 'error', text: 'Fill office, truck, and date first.' }); return }
    setLoading(true)
    const { data, error } = await supabase.from('lr_entries').select('*').eq('office', office).eq('status', 'booked').order('date', { ascending: true })
    setLoading(false)
    if (error) { setMsg({ type: 'error', text: error.message }); return }
    setPendingLRs(data || [])
    setSelected((data || []).map(l => l.id))
    setMsg(null)
  }

  async function createInvoice() {
    if (!selected.length) { setMsg({ type: 'error', text: 'Select at least one LR.' }); return }
    setLoading(true)
    const { data: invData, error: invErr } = await supabase.from('invoices').insert([{
      office, truck_number: truck, driver_name: driver || null,
      departure_date: date, dispatched_at: new Date().toISOString(),
    }]).select().single()
    if (invErr) { setLoading(false); setMsg({ type: 'error', text: invErr.message }); return }

    const { error: lrErr } = await supabase.from('lr_entries').update({
      status: 'transit', dispatched_at: new Date().toISOString(), invoice_id: invData.id
    }).in('id', selected)
    setLoading(false)
    if (lrErr) { setMsg({ type: 'error', text: lrErr.message }); return }

    const dispatchedLRs = pendingLRs.filter(l => selected.includes(l.id))
    setInvoice({ ...invData, lrs: dispatchedLRs })
    setPendingLRs([])
    setSelected([])
    setMsg({ type: 'success', text: `Invoice #${invData.id.slice(-6).toUpperCase()} created. ${selected.length} LRs marked in transit.` })
  }

  function toggleSelect(id) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  const payLabel = { topay: 'To Pay', paid: 'Paid', blank: '—' }
  const totalKg = (invoice?.lrs || []).reduce((s, l) => s + (l.weight_kg || 0), 0)
  const totalAmt = (invoice?.lrs || []).reduce((s, l) => s + (l.amount || 0), 0)

  return (
    <div className="page">
      <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: '1rem' }}>Dispatch &amp; invoice</h1>

      <div className="card no-print">
        <p className="sec-title">Truck details</p>
        <div className="g3">
          <div className="fg">
            <label>Dispatching office *</label>
            <select value={office} onChange={e => { setOffice(e.target.value); setPendingLRs([]); setInvoice(null) }}>
              <option value="">— select office —</option>
              {OFFICES.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="fg"><label>Truck number *</label><input value={truck} onChange={e => setTruck(e.target.value)} placeholder="e.g. MH04-AB-1234" /></div>
          <div className="fg"><label>Departure date *</label><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
        </div>
        <div className="fg"><label>Driver name (optional)</label><input value={driver} onChange={e => setDriver(e.target.value)} placeholder="e.g. Ramesh Patel" /></div>
        <button className="btn btn-blue" onClick={loadPending} disabled={loading}>
          {loading ? 'Loading...' : '↓ Load pending LRs for ' + (office || 'office')}
        </button>
        {msg && <div className={msg.type === 'success' ? 'msg-success' : 'msg-error'} style={{ marginTop: 10 }}>{msg.text}</div>}
      </div>

      {pendingLRs.length > 0 && (
        <div className="card no-print">
          <div className="card-header">
            <p className="card-title">{pendingLRs.length} pending LRs for {office}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-sm" onClick={() => setSelected(pendingLRs.map(l => l.id))}>Select all</button>
              <button className="btn btn-sm" onClick={() => setSelected([])}>Deselect all</button>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th></th><th>LR No.</th><th>Consignor</th><th>Consignee</th><th>Particulars</th><th>Wt (kg)</th><th>Payment</th></tr></thead>
              <tbody>
                {pendingLRs.map(l => (
                  <tr key={l.id} onClick={() => toggleSelect(l.id)} style={{ cursor: 'pointer' }}>
                    <td><input type="checkbox" checked={selected.includes(l.id)} onChange={() => toggleSelect(l.id)} style={{ width: 'auto' }} /></td>
                    <td style={{ fontWeight: 500 }}>{l.lr_number}</td>
                    <td>{l.consignor}</td>
                    <td>{l.consignee}</td>
                    <td>{l.particulars || '—'}</td>
                    <td>{l.weight_kg || '—'}</td>
                    <td>{payLabel[l.payment_type]}{l.amount ? ` · Rs.${Number(l.amount).toLocaleString('en-IN')}` : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={createInvoice} disabled={loading || !selected.length}>
              {loading ? 'Creating...' : `✓ Dispatch ${selected.length} LRs & generate invoice`}
            </button>
          </div>
        </div>
      )}

      {pendingLRs.length === 0 && office && !invoice && !loading && (
        <div className="card no-print"><p style={{ fontSize: 13, color: 'var(--text2)' }}>No pending LRs for {office}. All booked LRs have been dispatched.</p></div>
      )}

      {invoice && (
        <div className="card" style={{ borderColor: '#9FE1CB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 16, fontWeight: 600 }}>New Diamond Transport Service</p>
              <p style={{ fontSize: 12, color: 'var(--text2)' }}>Old Lati Bazar, Opp. Satkar Guest House, B/H. S.T. Stand · 7878548055, 9512614040</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 14, fontWeight: 600 }}>Invoice #{invoice.id.slice(-6).toUpperCase()}</p>
              <p style={{ fontSize: 12, color: 'var(--text2)' }}>{fmtDate(invoice.departure_date)}</p>
            </div>
          </div>
          <hr className="divider" />
          <div className="g3" style={{ fontSize: 13, gap: 10, marginBottom: 12 }}>
            <div><span style={{ color: 'var(--text2)' }}>From</span><br /><strong>{invoice.office}</strong></div>
            <div><span style={{ color: 'var(--text2)' }}>To</span><br /><strong>Ahmedabad</strong></div>
            <div><span style={{ color: 'var(--text2)' }}>Truck</span><br /><strong>{invoice.truck_number}</strong></div>
            <div><span style={{ color: 'var(--text2)' }}>Driver</span><br /><strong>{invoice.driver_name || '—'}</strong></div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>LR No.</th><th>Articles</th><th>Particulars</th><th>Consignee</th><th>Wt (kg)</th><th>Amount</th></tr></thead>
              <tbody>
                {invoice.lrs.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 500 }}>{l.lr_number}</td>
                    <td>{l.articles || '—'}</td>
                    <td>{l.particulars || '—'}</td>
                    <td>{l.consignee}</td>
                    <td>{l.weight_kg || '—'}</td>
                    <td>{l.payment_type === 'topay' ? 'To Pay' : l.amount ? `Rs.${Number(l.amount).toLocaleString('en-IN')}` : '—'}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 600, borderTop: '1px solid var(--border2)' }}>
                  <td colSpan={4}>Total — {invoice.lrs.length} LRs</td>
                  <td>{Math.round(totalKg)} kg</td>
                  <td>{totalAmt ? `Rs.${Math.round(totalAmt).toLocaleString('en-IN')}` : '—'}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={() => window.print()}>🖨 Print invoice</button>
            <button className="btn btn-sm no-print" onClick={() => { setInvoice(null); setOffice(''); setTruck(''); setDriver('') }}>New dispatch</button>
          </div>
        </div>
      )}
    </div>
  )
}
