import { useState, useEffect, useCallback } from 'react'
import { supabase, fmtDate, fmtDT } from '../lib/supabase'

const today = () => new Date().toISOString().slice(0, 10)

export default function OfficeDashboard({ user }) {
  const office = user.office
  const [stats, setStats] = useState(null)
  const [allLRs, setAllLRs] = useState([])
  const [filterStatus, setFilterStatus] = useState('')
  const [searchLR, setSearchLR] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleteMsg, setDeleteMsg] = useState(null)

  // Dispatch state
  const [truck, setTruck] = useState('')
  const [driver, setDriver] = useState('')
  const [date, setDate] = useState(today())
  const [pendingLRs, setPendingLRs] = useState([])
  const [selected, setSelected] = useState([])
  const [invoice, setInvoice] = useState(null)
  const [dispatchLoading, setDispatchLoading] = useState(false)
  const [dispatchMsg, setDispatchMsg] = useState(null)
  const [activeTab, setActiveTab] = useState('lrs')

  const sBg = { booked: '#E6F1FB', transit: '#FAEEDA', arrived: '#E1F5EE', delivered: '#F1EFE8' }
  const sCol = { booked: '#185FA5', transit: '#854F0B', arrived: '#0F6E56', delivered: '#5F5E5A' }
  const sLabel = { booked: 'Booked', transit: 'In transit', arrived: 'Arrived', delivered: 'Delivered' }

  const loadData = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('lr_entries').select('*').eq('office', office).order('booked_at', { ascending: false })
    const lrs = data || []
    setAllLRs(lrs)
    setStats({
      total: lrs.length,
      booked: lrs.filter(l => l.status === 'booked').length,
      transit: lrs.filter(l => l.status === 'transit').length,
      arrived: lrs.filter(l => l.status === 'arrived').length,
      delivered: lrs.filter(l => l.status === 'delivered').length,
      totalKg: Math.round(lrs.reduce((s, l) => s + (l.weight_kg || 0), 0)),
    })
    setLoading(false)
  }, [office])

  useEffect(() => { loadData() }, [loadData])

  async function loadPending() {
    if (!truck || !date) { setDispatchMsg({ type: 'error', text: 'Enter truck number and date.' }); return }
    const { data } = await supabase.from('lr_entries').select('*').eq('office', office).eq('status', 'booked').order('date', { ascending: true })
    setPendingLRs(data || [])
    setSelected((data || []).map(l => l.id))
    setDispatchMsg(null)
  }

  async function createInvoice() {
    if (!selected.length) { setDispatchMsg({ type: 'error', text: 'Select at least one LR.' }); return }
    setDispatchLoading(true)
    const { data: invData, error: invErr } = await supabase.from('invoices').insert([{
      office, truck_number: truck, driver_name: driver || null,
      departure_date: date, dispatched_at: new Date().toISOString(),
    }]).select().single()
    if (invErr) { setDispatchLoading(false); setDispatchMsg({ type: 'error', text: invErr.message }); return }
    await supabase.from('lr_entries').update({
      status: 'transit', dispatched_at: new Date().toISOString(), invoice_id: invData.id
    }).in('id', selected)
    setDispatchLoading(false)
    const dispatchedLRs = pendingLRs.filter(l => selected.includes(l.id))
    setInvoice({ ...invData, lrs: dispatchedLRs })
    setPendingLRs([]); setSelected([])
    setDispatchMsg({ type: 'success', text: `${selected.length} LRs dispatched successfully.` })
    loadData()
  }

  async function deleteLR(lr) {
    const { error } = await supabase.from('lr_entries').delete().eq('id', lr.id)
    if (error) { setDeleteMsg({ type: 'error', text: error.message }); return }
    setDeleteConfirm(null)
    setDeleteMsg({ type: 'success', text: `LR ${lr.lr_number} deleted.` })
    setTimeout(() => setDeleteMsg(null), 3000)
    loadData()
  }

  const filtered = allLRs.filter(l => {
    if (filterStatus && l.status !== filterStatus) return false
    if (searchLR && !l.lr_number.includes(searchLR)) return false
    return true
  })

  const totalKgInvoice = (invoice?.lrs || []).reduce((s, l) => s + (l.weight_kg || 0), 0)

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 500 }}>{office} office</h1>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{office} → Ahmedabad</p>
        </div>
        <button className="btn btn-sm" onClick={loadData}>↺ Refresh</button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="g4" style={{ marginBottom: '1.25rem' }}>
          <div className="metric"><div className="metric-label">Total LRs</div><div className="metric-val">{stats.total}</div><div className="metric-sub">{stats.totalKg.toLocaleString('en-IN')} kg</div></div>
          <div className="metric"><div className="metric-label">Pending dispatch</div><div className="metric-val" style={{ color: '#185FA5' }}>{stats.booked}</div></div>
          <div className="metric"><div className="metric-label">In transit</div><div className="metric-val" style={{ color: '#854F0B' }}>{stats.transit}</div></div>
          <div className="metric"><div className="metric-label">Delivered</div><div className="metric-val" style={{ color: '#0F6E56' }}>{stats.delivered}</div></div>
        </div>
      )}

      {deleteMsg && <div className={deleteMsg.type === 'success' ? 'msg-success' : 'msg-error'} style={{ marginBottom: 12 }}>{deleteMsg.text}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '0.5px solid var(--border)', marginBottom: '1rem' }}>
        {['lrs', 'dispatch'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            style={{ padding: '10px 16px', fontSize: 13, cursor: 'pointer', border: 'none', background: 'none', borderBottom: activeTab === t ? '2px solid var(--text)' : '2px solid transparent', fontWeight: activeTab === t ? 500 : 400, color: activeTab === t ? 'var(--text)' : 'var(--text2)', fontFamily: 'inherit' }}>
            {t === 'lrs' ? `All LRs (${allLRs.length})` : 'Dispatch truck'}
          </button>
        ))}
      </div>

      {/* LRs Tab */}
      {activeTab === 'lrs' && (
        <div className="card">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ flex: '1 1 140px' }}>
              <option value="">All statuses</option>
              <option value="booked">Booked</option>
              <option value="transit">In transit</option>
              <option value="arrived">Arrived</option>
              <option value="delivered">Delivered</option>
            </select>
            <input value={searchLR} onChange={e => setSearchLR(e.target.value)} placeholder="Search LR number..." style={{ flex: '2 1 160px' }} />
            <button className="btn btn-sm" onClick={() => { setFilterStatus(''); setSearchLR('') }}>Clear</button>
          </div>
          {loading ? <p className="loading">Loading...</p> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>LR No.</th><th>Date</th><th>Consignor</th><th>Consignee</th><th>Particulars</th><th>Wt (kg)</th><th>Payment</th><th>Status</th><th>Delete</th></tr></thead>
                <tbody>
                  {filtered.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text2)', padding: '1.5rem' }}>No LRs found.</td></tr>}
                  {filtered.map(l => (
                    <tr key={l.id}>
                      <td style={{ fontWeight: 500 }}>{l.lr_number}</td>
                      <td>{fmtDate(l.date)}</td>
                      <td>{l.consignor}</td>
                      <td>{l.consignee}</td>
                      <td>{l.particulars || '—'}</td>
                      <td>{l.weight_kg || '—'}</td>
                      <td>{l.payment_type === 'topay' ? 'To Pay' : l.amount ? `Rs.${Number(l.amount).toLocaleString('en-IN')}` : '—'}</td>
                      <td><span className="badge" style={{ background: sBg[l.status], color: sCol[l.status] }}>{sLabel[l.status]}</span></td>
                      <td><button className="btn btn-sm" style={{ color: '#993C1D', borderColor: '#F5C4B8' }} onClick={() => setDeleteConfirm(l)}>🗑</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Dispatch Tab */}
      {activeTab === 'dispatch' && (
        <>
          <div className="card">
            <p className="sec-title">Truck details</p>
            <div className="g3">
              <div className="fg"><label>Truck number *</label><input value={truck} onChange={e => setTruck(e.target.value)} placeholder="e.g. MH04-AB-1234" /></div>
              <div className="fg"><label>Departure date *</label><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
              <div className="fg"><label>Driver name</label><input value={driver} onChange={e => setDriver(e.target.value)} placeholder="optional" /></div>
            </div>
            <button className="btn btn-blue" onClick={loadPending}>↓ Load pending LRs</button>
            {dispatchMsg && <div className={dispatchMsg.type === 'success' ? 'msg-success' : 'msg-error'} style={{ marginTop: 10 }}>{dispatchMsg.text}</div>}
          </div>

          {pendingLRs.length > 0 && (
            <div className="card">
              <div className="card-header">
                <p className="card-title">{pendingLRs.length} pending LRs</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-sm" onClick={() => setSelected(pendingLRs.map(l => l.id))}>All</button>
                  <button className="btn btn-sm" onClick={() => setSelected([])}>None</button>
                </div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th></th><th>LR No.</th><th>Consignee</th><th>Particulars</th><th>Wt (kg)</th><th>Payment</th></tr></thead>
                  <tbody>
                    {pendingLRs.map(l => (
                      <tr key={l.id} onClick={() => setSelected(s => s.includes(l.id) ? s.filter(x => x !== l.id) : [...s, l.id])} style={{ cursor: 'pointer' }}>
                        <td><input type="checkbox" checked={selected.includes(l.id)} onChange={() => {}} style={{ width: 'auto' }} /></td>
                        <td style={{ fontWeight: 500 }}>{l.lr_number}</td>
                        <td>{l.consignee}</td>
                        <td>{l.particulars || '—'}</td>
                        <td>{l.weight_kg || '—'}</td>
                        <td>{l.payment_type === 'topay' ? 'To Pay' : l.amount ? `Rs.${Number(l.amount).toLocaleString('en-IN')}` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 12 }}>
                <button className="btn btn-primary" onClick={createInvoice} disabled={dispatchLoading || !selected.length}>
                  {dispatchLoading ? 'Creating...' : `✓ Dispatch ${selected.length} LRs & generate invoice`}
                </button>
              </div>
            </div>
          )}

          {pendingLRs.length === 0 && !invoice && truck && (
            <div className="card"><p style={{ fontSize: 13, color: 'var(--text2)' }}>No pending LRs to dispatch. All booked LRs have been dispatched.</p></div>
          )}

          {invoice && (
            <div className="card" style={{ borderColor: '#9FE1CB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 600 }}>New Diamond Transport Service</p>
                  <p style={{ fontSize: 12, color: 'var(--text2)' }}>Old Lati Bazar, Opp. Satkar Guest House · 7878548055</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 14, fontWeight: 600 }}>Invoice #{invoice.id.slice(-6).toUpperCase()}</p>
                  <p style={{ fontSize: 12, color: 'var(--text2)' }}>{fmtDate(invoice.departure_date)}</p>
                </div>
              </div>
              <hr className="divider" />
              <div className="g3" style={{ fontSize: 13, marginBottom: 12 }}>
                <div><span style={{ color: 'var(--text2)' }}>From</span><br /><strong>{invoice.office}</strong></div>
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
                    <tr style={{ fontWeight: 600 }}>
                      <td colSpan={4}>Total — {invoice.lrs.length} LRs</td>
                      <td>{Math.round(totalKgInvoice)} kg</td>
                      <td>—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={() => window.print()}>🖨 Print invoice</button>
                <button className="btn btn-sm" onClick={() => { setInvoice(null); setTruck(''); setDriver('') }}>New dispatch</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: 400, width: '100%' }}>
            <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>Delete LR {deleteConfirm.lr_number}?</h3>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>{deleteConfirm.consignee} · {deleteConfirm.particulars || '—'}</p>
            <p style={{ fontSize: 13, marginBottom: 16 }}>Status: <span className="badge" style={{ background: sBg[deleteConfirm.status], color: sCol[deleteConfirm.status] }}>{sLabel[deleteConfirm.status]}</span></p>
            <p className="msg-error" style={{ marginBottom: 16 }}>⚠️ This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-sm" style={{ background: '#993C1D', color: '#fff', borderColor: '#993C1D' }} onClick={() => deleteLR(deleteConfirm)}>Yes, delete</button>
              <button className="btn btn-sm" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
