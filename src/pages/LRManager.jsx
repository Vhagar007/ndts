import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase, fmtDate, fmtDT } from '../lib/supabase'
import NewLR from './NewLR'

const sBg   = { booked: '#E6F1FB', transit: '#FAEEDA', arrived: '#E1F5EE', delivered: '#F1EFE8' }
const sCol  = { booked: '#185FA5', transit: '#854F0B', arrived: '#0F6E56', delivered: '#5F5E5A' }
const sLabel = { booked: 'Booked', transit: 'In transit', arrived: 'Arrived Ahmedabad', delivered: 'Delivered' }
const payLabel = { topay: 'To Pay', paid: 'Paid', blank: '—' }

function LRSearch({ user, onFound, placeholder = 'Enter LR number' }) {
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  async function search() {
    if (!q.trim()) return
    setLoading(true); setMsg(null)
    let query = supabase.from('lr_entries').select('*').eq('lr_number', q.trim())
    if (user.role === 'office') query = query.eq('office', user.office)
    const { data } = await query
    setLoading(false)
    if (!data || !data.length) { setMsg('No LR found for "' + q + '"'); return }
    onFound(data)
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={q} onChange={e => setQ(e.target.value)}
          placeholder={placeholder} onKeyDown={e => e.key === 'Enter' && search()} style={{ flex: 1 }} />
        <button className="btn btn-blue" onClick={search} disabled={loading}>
          {loading ? 'Searching...' : '🔍 Search'}
        </button>
      </div>
      {msg && <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 8 }}>{msg}</p>}
    </div>
  )
}

function LRCard({ lr, actions }) {
  return (
    <div className="card" style={{ marginTop: 12, borderLeft: `3px solid ${sCol[lr.status]}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <p style={{ fontWeight: 600, fontSize: 16 }}>LR {lr.lr_number}
            {lr.book_series && <span className="tag" style={{ marginLeft: 8, fontSize: 11 }}>Book {lr.book_series}</span>}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{lr.office} → Ahmedabad · {fmtDate(lr.date)}</p>
        </div>
        <span className="badge" style={{ background: sBg[lr.status], color: sCol[lr.status] }}>{sLabel[lr.status]}</span>
      </div>
      <div className="g3" style={{ fontSize: 13, gap: 8, marginBottom: 10 }}>
        <div><span style={{ color: 'var(--text2)' }}>Consignor</span><br /><strong>{lr.consignor}</strong>{lr.consignor_gst && <span style={{ fontSize: 11, color: 'var(--text2)' }}><br />GST: {lr.consignor_gst}</span>}</div>
        <div><span style={{ color: 'var(--text2)' }}>Consignee</span><br /><strong>{lr.consignee}</strong>{lr.consignee_gst && <span style={{ fontSize: 11, color: 'var(--text2)' }}><br />GST: {lr.consignee_gst}</span>}</div>
        <div><span style={{ color: 'var(--text2)' }}>Particulars</span><br /><strong>{lr.particulars || '—'}</strong></div>
        <div><span style={{ color: 'var(--text2)' }}>Articles</span><br /><strong>{lr.articles || '—'}</strong></div>
        <div><span style={{ color: 'var(--text2)' }}>Weight</span><br /><strong>{lr.weight_kg ? lr.weight_kg + ' kg' : '—'}</strong></div>
        <div><span style={{ color: 'var(--text2)' }}>Payment</span><br /><strong>{payLabel[lr.payment_type]}{lr.amount ? ` · Rs.${Number(lr.amount).toLocaleString('en-IN')}` : ''}</strong></div>
      </div>
      <div style={{ background: 'var(--bg2)', borderRadius: 8, padding: '8px 12px', marginBottom: actions ? 10 : 0, fontSize: 12 }}>
        {[
          { label: 'Booked',             time: lr.booked_at },
          { label: 'Dispatched',         time: lr.dispatched_at },
          { label: 'Arrived Ahmedabad',  time: lr.arrived_at },
          { label: 'Delivered',          time: lr.delivered_at },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, padding: '3px 0', alignItems: 'center' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: s.time ? '#1D9E75' : 'var(--border2)' }} />
            <span style={{ flex: 1, color: s.time ? 'var(--text)' : 'var(--text2)' }}>{s.label}</span>
            <span style={{ color: 'var(--text2)' }}>{s.time ? fmtDT(s.time) : 'Pending'}</span>
          </div>
        ))}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
    </div>
  )
}

function SearchView({ user }) {
  const [results, setResults] = useState([])
  return (
    <div>
      <h2 style={{ fontSize: 17, fontWeight: 500, marginBottom: '1rem' }}>Search LR</h2>
      <div className="card">
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 10 }}>Search by LR number to view full details and status timeline.</p>
        <LRSearch user={user} onFound={setResults} placeholder="Enter LR number e.g. 100001" />
      </div>
      {results.map(lr => <LRCard key={lr.id} lr={lr} />)}
    </div>
  )
}

function EditView({ user }) {
  const [results, setResults] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

  function startEdit(lr) {
    setEditing(lr)
    setForm({
      date: lr.date || '', consignor: lr.consignor || '', consignor_gst: lr.consignor_gst || '',
      consignee: lr.consignee || '', consignee_gst: lr.consignee_gst || '',
      articles: lr.articles || '', weight_kg: lr.weight_kg || '',
      particulars: lr.particulars || '', payment_type: lr.payment_type || 'topay',
      amount: lr.amount || '', truck_number: lr.truck_number || '',
    })
    setMsg(null)
  }

  async function saveEdit() {
    setSaving(true)
    const { error } = await supabase.from('lr_entries').update({
      date: form.date, consignor: form.consignor.trim(),
      consignor_gst: form.consignor_gst.trim() || null,
      consignee: form.consignee.trim(),
      consignee_gst: form.consignee_gst.trim() || null,
      articles: form.articles || null,
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
      particulars: form.particulars.trim() || null,
      payment_type: form.payment_type,
      amount: form.amount ? parseFloat(form.amount) : null,
      truck_number: form.truck_number.trim() || null,
    }).eq('id', editing.id)
    setSaving(false)
    if (error) { setMsg({ type: 'error', text: error.message }); return }
    setMsg({ type: 'success', text: `LR ${editing.lr_number} updated successfully.` })
    setEditing(null); setResults([])
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div>
      <h2 style={{ fontSize: 17, fontWeight: 500, marginBottom: '1rem' }}>Edit LR</h2>
      {!editing ? (
        <>
          <div className="card">
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 10 }}>Search the LR you want to edit.</p>
            <LRSearch user={user} onFound={setResults} placeholder="Enter LR number to edit" />
          </div>
          {results.map(lr => (
            <LRCard key={lr.id} lr={lr} actions={[
              <button key="e" className="btn btn-blue btn-sm" onClick={() => startEdit(lr)}>✏️ Edit this LR</button>
            ]} />
          ))}
        </>
      ) : (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 16 }}>Editing LR {editing.lr_number}</p>
              <p style={{ fontSize: 12, color: 'var(--text2)' }}>{editing.office} · Book {editing.book_series || '—'}</p>
            </div>
            <button className="btn btn-sm" onClick={() => { setEditing(null); setResults([]) }}>← Back</button>
          </div>
          <div className="g2">
            <div className="fg"><label>Date</label><input type="date" value={form.date} onChange={e => set('date', e.target.value)} /></div>
            <div className="fg"><label>Truck number</label><input value={form.truck_number} onChange={e => set('truck_number', e.target.value)} /></div>
          </div>
          <div className="g2">
            <div className="fg"><label>Consignor *</label><input value={form.consignor} onChange={e => set('consignor', e.target.value)} /></div>
            <div className="fg"><label>Consignee *</label><input value={form.consignee} onChange={e => set('consignee', e.target.value)} /></div>
          </div>
          <div className="g2">
            <div className="fg"><label>Consignor GST</label><input value={form.consignor_gst} onChange={e => set('consignor_gst', e.target.value)} placeholder="optional" /></div>
            <div className="fg"><label>Consignee GST</label><input value={form.consignee_gst} onChange={e => set('consignee_gst', e.target.value)} placeholder="optional" /></div>
          </div>
          <div className="g3">
            <div className="fg"><label>Articles</label><input type="number" value={form.articles} onChange={e => set('articles', e.target.value)} /></div>
            <div className="fg"><label>Weight (kg)</label><input type="number" value={form.weight_kg} onChange={e => set('weight_kg', e.target.value)} /></div>
            <div className="fg"><label>Particulars</label><input value={form.particulars} onChange={e => set('particulars', e.target.value)} /></div>
          </div>
          <div className="g2">
            <div className="fg">
              <label>Payment</label>
              <select value={form.payment_type} onChange={e => set('payment_type', e.target.value)}>
                <option value="topay">To Pay</option>
                <option value="paid">Paid</option>
                <option value="blank">—</option>
              </select>
            </div>
            <div className="fg"><label>Amount (Rs.)</label><input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} /></div>
          </div>
          <hr className="divider" />
          {msg && <div className={msg.type === 'success' ? 'msg-success' : 'msg-error'} style={{ marginBottom: 10 }}>{msg.text}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={saveEdit} disabled={saving}>{saving ? 'Saving...' : '✓ Save changes'}</button>
            <button className="btn" onClick={() => { setEditing(null); setResults([]) }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

function DeleteView({ user }) {
  const [results, setResults] = useState([])
  const [confirm, setConfirm] = useState(null)
  const [msg, setMsg] = useState(null)

  async function doDelete(lr) {
    const { error } = await supabase.from('lr_entries').delete().eq('id', lr.id)
    if (error) { setMsg({ type: 'error', text: error.message }); return }
    setConfirm(null)
    setResults(r => r.filter(x => x.id !== lr.id))
    setMsg({ type: 'success', text: `LR ${lr.lr_number} deleted permanently.` })
  }

  return (
    <div>
      <h2 style={{ fontSize: 17, fontWeight: 500, marginBottom: '1rem' }}>Delete LR</h2>
      <div className="card">
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 10 }}>Search the LR you want to delete.</p>
        <LRSearch user={user} onFound={setResults} placeholder="Enter LR number to delete" />
        {msg && <div className={msg.type === 'success' ? 'msg-success' : 'msg-error'} style={{ marginTop: 10 }}>{msg.text}</div>}
      </div>
      {results.map(lr => (
        <LRCard key={lr.id} lr={lr} actions={[
          <button key="d" className="btn btn-sm" style={{ color: '#993C1D', borderColor: '#F5C4B8' }}
            onClick={() => setConfirm(lr)}>🗑 Delete this LR</button>
        ]} />
      ))}
      {confirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: 400, width: '100%' }}>
            <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>Delete LR {confirm.lr_number}?</h3>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>{confirm.consignee} · {confirm.particulars || '—'}</p>
            <p className="msg-error" style={{ marginBottom: 16 }}>⚠️ This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-sm" style={{ background: '#993C1D', color: '#fff', borderColor: '#993C1D' }} onClick={() => doDelete(confirm)}>Yes, delete</button>
              <button className="btn btn-sm" onClick={() => setConfirm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function LRManager({ user }) {
  const { view } = useParams()

  return (
    <div className="page">
      {view === 'new'    && <NewLR user={user} />}
      {view === 'edit'   && <EditView user={user} />}
      {view === 'delete' && <DeleteView user={user} />}
      {view === 'search' && <SearchView user={user} />}
    </div>
  )
}
