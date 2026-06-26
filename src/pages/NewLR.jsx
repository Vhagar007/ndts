import { useState } from 'react'
import { supabase, OFFICES, fmtDate } from '../lib/supabase'

const today = () => new Date().toISOString().slice(0, 10)

export default function NewLR() {
  const [office, setOffice] = useState('')
  const [form, setForm] = useState({ lr: '', date: today(), consignor: '', consignee: '', articles: '', weight: '', particulars: '', payment: 'topay', amount: '', gst: '', truck: '' })
  const [msg, setMsg] = useState(null)
  const [saved, setSaved] = useState(null)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSave() {
    if (!office || !form.lr || !form.date || !form.consignor || !form.consignee) {
      setMsg({ type: 'error', text: 'Please fill office, LR number, date, consignor and consignee.' })
      return
    }
    setLoading(true)
    const record = {
      lr_number: form.lr.trim(),
      office,
      date: form.date,
      consignor: form.consignor.trim(),
      consignee: form.consignee.trim(),
      articles: form.articles || null,
      weight_kg: form.weight ? parseFloat(form.weight) : null,
      particulars: form.particulars.trim() || null,
      payment_type: form.payment,
      amount: form.amount ? parseFloat(form.amount) : null,
      gst_number: form.gst.trim() || null,
      truck_number: form.truck.trim() || null,
      status: 'booked',
      booked_at: new Date().toISOString(),
    }
    const { data, error } = await supabase.from('lr_entries').insert([record]).select().single()
    setLoading(false)
    if (error) {
      if (error.code === '23505') setMsg({ type: 'error', text: `LR ${form.lr} from ${office} already exists.` })
      else setMsg({ type: 'error', text: error.message })
      return
    }
    setSaved(data)
    setMsg({ type: 'success', text: `LR ${form.lr} saved. Tracking ID: ${office.toUpperCase()}-${form.lr}` })
  }

  function handleClear() {
    setForm({ lr: '', date: today(), consignor: '', consignee: '', articles: '', weight: '', particulars: '', payment: 'topay', amount: '', gst: '', truck: '' })
    setMsg(null); setSaved(null)
  }

  const payLabel = { topay: 'To Pay', paid: 'Paid', blank: '—' }

  return (
    <div className="page">
      <div className="card-header" style={{ marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 500 }}>New LR entry</h1>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 3 }}>Booking offices: Bhiwandi · Vasai · Bhayandar · Dongri · Vapi → Ahmedabad</p>
        </div>
      </div>

      <div className="card">
        <div className="fg">
          <label>Booking office *</label>
          <select value={office} onChange={e => { setOffice(e.target.value); setMsg(null); setSaved(null) }}>
            <option value="">— select your office —</option>
            {OFFICES.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>

        {office && <>
          <div className="office-pill">📍 {office} → Ahmedabad</div>

          <div className="g2">
            <div className="fg"><label>LR number *</label><input value={form.lr} onChange={e => set('lr', e.target.value)} placeholder="e.g. 303432" /></div>
            <div className="fg"><label>Date *</label><input type="date" value={form.date} onChange={e => set('date', e.target.value)} /></div>
          </div>
          <div className="g2">
            <div className="fg"><label>Consignor (sender) *</label><input value={form.consignor} onChange={e => set('consignor', e.target.value)} placeholder="M/s. name" /></div>
            <div className="fg"><label>Consignee (receiver) *</label><input value={form.consignee} onChange={e => set('consignee', e.target.value)} placeholder="M/s. name" /></div>
          </div>
          <div className="g3">
            <div className="fg"><label>No. of articles</label><input type="number" value={form.articles} onChange={e => set('articles', e.target.value)} placeholder="e.g. 6" min="1" /></div>
            <div className="fg"><label>Weight (kg)</label><input type="number" value={form.weight} onChange={e => set('weight', e.target.value)} placeholder="e.g. 315" /></div>
            <div className="fg"><label>Truck number</label><input value={form.truck} onChange={e => set('truck', e.target.value)} placeholder="e.g. MH04-AB-1234" /></div>
          </div>
          <div className="g2">
            <div className="fg"><label>Particulars</label><input value={form.particulars} onChange={e => set('particulars', e.target.value)} placeholder="e.g. Torr Bio Mechanical" /></div>
            <div className="fg"><label>GST number (optional)</label><input value={form.gst} onChange={e => set('gst', e.target.value)} placeholder="optional" /></div>
          </div>
          <div className="g2">
            <div className="fg">
              <label>Payment</label>
              <select value={form.payment} onChange={e => set('payment', e.target.value)}>
                <option value="topay">To Pay</option>
                <option value="paid">Paid</option>
                <option value="blank">—</option>
              </select>
            </div>
            <div className="fg"><label>Amount (Rs.)</label><input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="e.g. 500" /></div>
          </div>

          <hr className="divider" />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : '✓ Save LR'}</button>
            <button className="btn" onClick={handleClear}>Clear</button>
          </div>
          {msg && <div className={msg.type === 'success' ? 'msg-success' : 'msg-error'} style={{ marginTop: 10 }}>{msg.text}</div>}
        </>}
      </div>

      {saved && (
        <div className="card print-preview" style={{ borderColor: '#9FE1CB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 16, fontWeight: 600 }}>New Diamond Transport Service</p>
              <p style={{ fontSize: 12, color: 'var(--text2)' }}>Old Lati Bazar, Opp. Satkar Guest House, B/H. S.T. Stand · 7878548055, 9512614040</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 20, fontWeight: 600 }}>LR No. {saved.lr_number}</p>
              <p style={{ fontSize: 12, color: 'var(--text2)' }}>{fmtDate(saved.date)}</p>
            </div>
          </div>
          <hr className="divider" />
          <div className="g3" style={{ fontSize: 13, gap: 10 }}>
            <div><span style={{ color: 'var(--text2)' }}>From</span><br /><strong>{saved.office}</strong></div>
            <div><span style={{ color: 'var(--text2)' }}>To</span><br /><strong>Ahmedabad</strong></div>
            <div><span style={{ color: 'var(--text2)' }}>Truck</span><br /><strong>{saved.truck_number || '—'}</strong></div>
            <div><span style={{ color: 'var(--text2)' }}>Consignor</span><br /><strong>{saved.consignor}</strong></div>
            <div><span style={{ color: 'var(--text2)' }}>Consignee</span><br /><strong>{saved.consignee}</strong></div>
            <div><span style={{ color: 'var(--text2)' }}>Articles / Weight</span><br /><strong>{saved.articles || '—'} pcs / {saved.weight_kg || '—'} kg</strong></div>
            <div><span style={{ color: 'var(--text2)' }}>Particulars</span><br /><strong>{saved.particulars || '—'}</strong></div>
            <div><span style={{ color: 'var(--text2)' }}>Payment</span><br /><strong>{payLabel[saved.payment_type]}</strong></div>
            <div><span style={{ color: 'var(--text2)' }}>Amount</span><br /><strong>{saved.amount ? `Rs. ${Number(saved.amount).toLocaleString('en-IN')}` : '—'}</strong></div>
          </div>
          <hr className="divider" />
          <p style={{ fontSize: 12, color: 'var(--text2)' }}>Track: <strong>newdiamond.in/track/{saved.office}/{saved.lr_number}</strong></p>
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={() => window.print()}>🖨 Print LR</button>
            <button className="btn btn-sm" onClick={handleClear}>New LR</button>
          </div>
        </div>
      )}
    </div>
  )
}
