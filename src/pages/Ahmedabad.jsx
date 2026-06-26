import { useState, useEffect, useCallback } from 'react'
import { supabase, fmtDate, fmtDT } from '../lib/supabase'

export default function Ahmedabad() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchLR, setSearchLR] = useState('')
  const [foundLRs, setFoundLRs] = useState([])
  const [searchMsg, setSearchMsg] = useState(null)
  const [receiverNames, setReceiverNames] = useState({})

  const loadInvoices = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('invoices').select('*').order('dispatched_at', { ascending: false }).limit(50)
    setInvoices(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { loadInvoices() }, [loadInvoices])

  async function markArrived(invoiceId) {
    const arrivedAt = new Date().toISOString()
    await supabase.from('invoices').update({ arrived_at: arrivedAt }).eq('id', invoiceId)
    await supabase.from('lr_entries').update({ status: 'arrived', arrived_at: arrivedAt }).eq('invoice_id', invoiceId).eq('status', 'transit')
    loadInvoices()
  }

  async function searchForDelivery() {
    if (!searchLR.trim()) return
    const { data } = await supabase.from('lr_entries').select('*').eq('lr_number', searchLR.trim()).in('status', ['arrived', 'delivered'])
    if (!data || !data.length) {
      setSearchMsg('No arrived LR found for "' + searchLR + '". It may not have arrived yet.')
      setFoundLRs([])
    } else {
      setFoundLRs(data)
      setSearchMsg(null)
    }
  }

  async function markDelivered(lrId) {
    const receiver = receiverNames[lrId] || ''
    await supabase.from('lr_entries').update({ status: 'delivered', delivered_at: new Date().toISOString(), receiver_name: receiver }).eq('id', lrId)
    setFoundLRs(prev => prev.map(l => l.id === lrId ? { ...l, status: 'delivered', receiver_name: receiver, delivered_at: new Date().toISOString() } : l))
  }

  const inTransit = invoices.filter(i => !i.arrived_at)
  const arrived = invoices.filter(i => i.arrived_at)

  return (
    <div className="page">
      <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: '1rem' }}>Ahmedabad — receiving</h1>

      <div className="card">
        <p className="sec-title">Trucks in transit ({inTransit.length})</p>
        {loading && <p className="loading">Loading...</p>}
        {!loading && inTransit.length === 0 && <p style={{ fontSize: 13, color: 'var(--text2)' }}>No trucks currently in transit.</p>}
        {inTransit.map(inv => (
          <div key={inv.id} style={{ padding: '12px 0', borderBottom: '0.5px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <span style={{ fontWeight: 500, fontSize: 14 }}>{inv.office} → Ahmedabad</span>
                &nbsp;<span className="badge" style={{ background: '#E6F1FB', color: '#185FA5' }}>In transit</span>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 3 }}>
                  {inv.truck_number} · {inv.driver_name || 'No driver'} · Dispatched {fmtDT(inv.dispatched_at)}
                </div>
              </div>
              <button className="btn btn-green btn-sm" onClick={() => markArrived(inv.id)}>✓ Mark truck arrived</button>
            </div>
          </div>
        ))}

        {arrived.length > 0 && <>
          <p className="sec-title" style={{ marginTop: '1rem' }}>Recently arrived ({arrived.length})</p>
          {arrived.slice(0, 8).map(inv => (
            <div key={inv.id} style={{ padding: '8px 0', borderBottom: '0.5px solid var(--border)', fontSize: 13 }}>
              <span style={{ fontWeight: 500 }}>{inv.office}</span> &nbsp;
              <span className="badge" style={{ background: '#E1F5EE', color: '#0F6E56' }}>Arrived</span>
              <span style={{ color: 'var(--text2)', marginLeft: 8 }}>{inv.truck_number} · Arrived {fmtDT(inv.arrived_at)}</span>
            </div>
          ))}
        </>}
      </div>

      <div className="card">
        <p className="sec-title">Mark LR delivered</p>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 10 }}>Search by LR number to mark individual parcels as delivered to consignee.</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input value={searchLR} onChange={e => setSearchLR(e.target.value)} placeholder="Enter LR number e.g. 303432"
            onKeyDown={e => e.key === 'Enter' && searchForDelivery()} style={{ flex: 1 }} />
          <button className="btn btn-blue" onClick={searchForDelivery}>Search</button>
        </div>
        {searchMsg && <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 8 }}>{searchMsg}</p>}
        {foundLRs.map(l => (
          <div key={l.id} className="card" style={{ marginTop: 8, background: 'var(--bg2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <span style={{ fontWeight: 500 }}>LR {l.lr_number}</span> &nbsp;
                <span className="badge" style={{ background: l.status === 'delivered' ? '#F1EFE8' : '#E1F5EE', color: l.status === 'delivered' ? '#5F5E5A' : '#0F6E56' }}>
                  {l.status === 'delivered' ? 'Delivered' : 'Arrived'}
                </span>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 3 }}>
                  {l.office} · {l.consignee} · {l.particulars || '—'} · {l.weight_kg || '—'} kg
                </div>
              </div>
            </div>
            {l.status === 'arrived' && (
              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                <input placeholder="Receiver name (optional)" value={receiverNames[l.id] || ''}
                  onChange={e => setReceiverNames(r => ({ ...r, [l.id]: e.target.value }))} style={{ flex: 1 }} />
                <button className="btn btn-green btn-sm" onClick={() => markDelivered(l.id)}>✓ Mark delivered</button>
              </div>
            )}
            {l.status === 'delivered' && (
              <p style={{ fontSize: 12, color: '#0F6E56', marginTop: 8 }}>✓ Delivered {fmtDT(l.delivered_at)}{l.receiver_name ? ` to ${l.receiver_name}` : ''}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
