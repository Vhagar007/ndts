import { useState, useEffect, useCallback } from 'react'
import { supabase, OFFICES, fmtDate, fmtDT } from '../lib/supabase'

export default function Dashboard({ user }) {
  const [stats, setStats] = useState(null)
  const [officeSummary, setOfficeSummary] = useState([])
  const [recent, setRecent] = useState([])
  const [allLRs, setAllLRs] = useState([])
  const [loading, setLoading] = useState(true)
  const [lrLoading, setLRLoading] = useState(false)
  const [filterOffice, setFilterOffice] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [searchLR, setSearchLR] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleteMsg, setDeleteMsg] = useState(null)

  const loadStats = useCallback(async () => {
    setLoading(true)
    const [{ data: lrData }, { data: invData }] = await Promise.all([
      supabase.from('lr_entries').select('id, status, office, weight_kg, amount, booked_at, date'),
      supabase.from('invoices').select('id, arrived_at'),
    ])
    const lrs = lrData || []
    const invs = invData || []
    setStats({
      total: lrs.length,
      booked: lrs.filter(l => l.status === 'booked').length,
      transit: lrs.filter(l => l.status === 'transit').length,
      arrived: lrs.filter(l => l.status === 'arrived').length,
      delivered: lrs.filter(l => l.status === 'delivered').length,
      totalKg: Math.round(lrs.reduce((s, l) => s + (l.weight_kg || 0), 0)),
      pendingTrucks: invs.filter(i => !i.arrived_at).length,
    })
    setOfficeSummary(OFFICES.map(o => ({
      office: o,
      booked: lrs.filter(l => l.office === o && l.status === 'booked').length,
      transit: lrs.filter(l => l.office === o && l.status === 'transit').length,
      arrived: lrs.filter(l => l.office === o && l.status === 'arrived').length,
      delivered: lrs.filter(l => l.office === o && l.status === 'delivered').length,
      total: lrs.filter(l => l.office === o).length,
    })))
    setLoading(false)
  }, [])

  const loadRecent = useCallback(async () => {
    const { data } = await supabase.from('lr_entries').select('*').order('booked_at', { ascending: false }).limit(8)
    setRecent(data || [])
  }, [])

  const loadAllLRs = useCallback(async () => {
    setLRLoading(true)
    let q = supabase.from('lr_entries').select('*').order('booked_at', { ascending: false }).limit(300)
    if (filterOffice) q = q.eq('office', filterOffice)
    if (filterStatus) q = q.eq('status', filterStatus)
    if (filterDate) q = q.eq('date', filterDate)
    if (searchLR) q = q.ilike('lr_number', `%${searchLR}%`)
    const { data } = await q
    setAllLRs(data || [])
    setLRLoading(false)
  }, [filterOffice, filterStatus, filterDate, searchLR])

  useEffect(() => { loadStats(); loadRecent() }, [loadStats, loadRecent])
  useEffect(() => { loadAllLRs() }, [loadAllLRs])

  async function deleteLR(lr) {
    const { error } = await supabase.from('lr_entries').delete().eq('id', lr.id)
    if (error) { setDeleteMsg({ type: 'error', text: error.message }); return }
    setDeleteConfirm(null)
    setDeleteMsg({ type: 'success', text: `LR ${lr.lr_number} deleted.` })
    setTimeout(() => setDeleteMsg(null), 3000)
    loadStats(); loadRecent(); loadAllLRs()
  }

  const sBg = { booked: '#E6F1FB', transit: '#FAEEDA', arrived: '#E1F5EE', delivered: '#F1EFE8' }
  const sCol = { booked: '#185FA5', transit: '#854F0B', arrived: '#0F6E56', delivered: '#5F5E5A' }
  const sLabel = { booked: 'Booked', transit: 'In transit', arrived: 'Arrived', delivered: 'Delivered' }

  return (
    <div className="page-wide">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 500 }}>Central dashboard</h1>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>All offices — New Diamond Transport Service</p>
        </div>
        <button className="btn btn-sm" onClick={() => { loadStats(); loadRecent(); loadAllLRs() }}>↺ Refresh</button>
      </div>

      {deleteMsg && <div className={deleteMsg.type === 'success' ? 'msg-success' : 'msg-error'} style={{ marginBottom: 12 }}>{deleteMsg.text}</div>}

      {loading ? <p className="loading">Loading...</p> : stats && <>
        <div className="g4" style={{ marginBottom: '1.25rem' }}>
          <div className="metric"><div className="metric-label">Total LRs</div><div className="metric-val">{stats.total}</div><div className="metric-sub">{stats.totalKg.toLocaleString('en-IN')} kg</div></div>
          <div className="metric"><div className="metric-label">Pending dispatch</div><div className="metric-val" style={{ color: '#185FA5' }}>{stats.booked}</div></div>
          <div className="metric"><div className="metric-label">In transit</div><div className="metric-val" style={{ color: '#854F0B' }}>{stats.transit}</div><div className="metric-sub">{stats.pendingTrucks} trucks en route</div></div>
          <div className="metric"><div className="metric-label">Arrived / Delivered</div><div className="metric-val" style={{ color: '#0F6E56' }}>{stats.arrived + stats.delivered}</div><div className="metric-sub">{stats.delivered} fully delivered</div></div>
        </div>

        <div className="g2" style={{ marginBottom: '1.25rem' }}>
          <div className="card">
            <p className="sec-title">Office-wise summary</p>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Office</th><th>Pending</th><th>Transit</th><th>Arrived</th><th>Delivered</th><th>Total</th></tr></thead>
                <tbody>
                  {officeSummary.map(o => (
                    <tr key={o.office}>
                      <td style={{ fontWeight: 500 }}>{o.office}</td>
                      <td style={{ color: '#185FA5' }}>{o.booked}</td>
                      <td style={{ color: '#854F0B' }}>{o.transit}</td>
                      <td style={{ color: '#0F6E56' }}>{o.arrived}</td>
                      <td style={{ color: '#5F5E5A' }}>{o.delivered}</td>
                      <td style={{ fontWeight: 500 }}>{o.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <p className="sec-title">Recent activity</p>
            {recent.map(l => (
              <div key={l.id} style={{ padding: '8px 0', borderBottom: '0.5px solid var(--border)', fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div><span style={{ fontWeight: 500 }}>{l.lr_number}</span> <span style={{ color: 'var(--text2)' }}>{l.office} · {l.consignee}</span></div>
                  <span className="badge" style={{ background: sBg[l.status], color: sCol[l.status] }}>{sLabel[l.status]}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{fmtDT(l.booked_at)}</div>
              </div>
            ))}
          </div>
        </div>
      </>}

      <div className="card">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12, alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 120px' }}>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>Office</div>
            <select value={filterOffice} onChange={e => setFilterOffice(e.target.value)}>
              <option value="">All offices</option>
              {OFFICES.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div style={{ flex: '1 1 120px' }}>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>Status</div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All statuses</option>
              <option value="booked">Booked</option>
              <option value="transit">In transit</option>
              <option value="arrived">Arrived</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
          <div style={{ flex: '1 1 130px' }}>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>Date</div>
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
          </div>
          <div style={{ flex: '2 1 160px' }}>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>Search LR</div>
            <input value={searchLR} onChange={e => setSearchLR(e.target.value)} placeholder="LR number..." />
          </div>
          <button className="btn btn-sm" onClick={() => { setFilterOffice(''); setFilterStatus(''); setFilterDate(''); setSearchLR('') }}>Clear</button>
        </div>

        {lrLoading ? <p className="loading">Loading...</p> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>LR No.</th><th>Office</th><th>Date</th><th>Consignor</th><th>Consignee</th><th>Particulars</th><th>Wt</th><th>Status</th><th>Booked</th><th>Delete</th></tr>
              </thead>
              <tbody>
                {allLRs.length === 0 && <tr><td colSpan={10} style={{ textAlign: 'center', color: 'var(--text2)', padding: '1.5rem' }}>No LRs found.</td></tr>}
                {allLRs.map(l => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 500 }}>{l.lr_number}</td>
                    <td>{l.office}</td>
                    <td>{fmtDate(l.date)}</td>
                    <td>{l.consignor}</td>
                    <td>{l.consignee}</td>
                    <td>{l.particulars || '—'}</td>
                    <td>{l.weight_kg || '—'}</td>
                    <td><span className="badge" style={{ background: sBg[l.status], color: sCol[l.status] }}>{sLabel[l.status]}</span></td>
                    <td style={{ color: 'var(--text2)', fontSize: 12 }}>{fmtDT(l.booked_at)}</td>
                    <td>
                      <button className="btn btn-sm" style={{ color: '#993C1D', borderColor: '#F5C4B8' }}
                        onClick={() => setDeleteConfirm(l)}>🗑 Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: 400, width: '100%' }}>
            <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>Delete LR {deleteConfirm.lr_number}?</h3>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>
              {deleteConfirm.office} · {deleteConfirm.consignee} · {deleteConfirm.particulars || '—'}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
              Status: <span className="badge" style={{ background: sBg[deleteConfirm.status], color: sCol[deleteConfirm.status] }}>{sLabel[deleteConfirm.status]}</span>
            </p>
            <p className="msg-error" style={{ marginBottom: 16 }}>⚠️ This cannot be undone. The LR record will be permanently deleted.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-sm" style={{ background: '#993C1D', color: '#fff', borderColor: '#993C1D' }}
                onClick={() => deleteLR(deleteConfirm)}>Yes, delete permanently</button>
              <button className="btn btn-sm" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
