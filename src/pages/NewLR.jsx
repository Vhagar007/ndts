import { useState, useEffect } from 'react'
import { supabase, fmtDate } from '../lib/supabase'
import PartyInput from '../components/PartyInput'
import LRPrint from '../components/LRPrint'

const today = () => new Date().toISOString().slice(0,10)
const OFFICES = ['Bhiwandi','Vasai','Bhayandar','Dongri','Vapi']
const OFFICE_BOOKS = {
  Vasai:     {A:{start:100001,end:199999},B:{start:200001,end:299999}},
  Bhiwandi:  {A:{start:300001,end:399999},B:{start:400001,end:499999}},
  Bhayandar: {A:{start:500001,end:599999},B:{start:600001,end:699999}},
  Dongri:    {A:{start:700001,end:799999},B:{start:800001,end:899999}},
  Vapi:      {A:{start:10001, end:19999 },B:{start:20001, end:29999 }},
}

export default function NewLR({ user }) {
  const office = user.office === 'Admin' ? '' : user.office
  const [adminOffice, setAdminOffice] = useState('')
  const activeOffice = user.office === 'Admin' ? adminOffice : office
  const [selectedBook, setSelectedBook] = useState('')
  const [lrLoading, setLRLoading] = useState(false)
  const [lrMsg, setLRMsg] = useState(null)
  const [form, setForm] = useState({lr:'',date:today(),consignor:'',consignor_gst:'',consignee:'',consignee_gst:'',articles:'',weight:'',particulars:'',payment:'topay',amount:'',truck:''})
  const [msg, setMsg] = useState(null)
  const [saved, setSaved] = useState(null)
  const [printing, setPrinting] = useState(false)
  const [loading, setLoading] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  const payLabel = {topay:'To Pay',paid:'Paid',blank:'—'}
  const officeBooks = activeOffice ? OFFICE_BOOKS[activeOffice] : null

  useEffect(() => {
    if (!selectedBook || !activeOffice) { setLRMsg(null); setForm(f=>({...f,lr:''})); return }
    fetchNextLR(selectedBook, activeOffice)
  }, [selectedBook, activeOffice])

  async function fetchNextLR(book, off) {
    const bookDef = OFFICE_BOOKS[off]?.[book]; if (!bookDef) return
    setLRLoading(true); setLRMsg(null)
    const {data} = await supabase.from('lr_entries').select('lr_number').eq('office',off).gte('lr_number',bookDef.start.toString()).lte('lr_number',bookDef.end.toString()).order('lr_number',{ascending:false}).limit(1)
    setLRLoading(false)
    let next = (!data||!data.length) ? bookDef.start : parseInt(data[0].lr_number)+1
    if (next > bookDef.end) { setLRMsg({type:'error',text:`Book ${book} is full.`}); setForm(f=>({...f,lr:''})); return }
    setForm(f=>({...f,lr:next.toString()}))
    setLRMsg({type:'info',text:`Book ${book} · Next: ${next.toLocaleString('en-IN')} · ${(bookDef.end-next+1).toLocaleString('en-IN')} remaining`})
  }

  async function handleSave() {
    if (!activeOffice||!form.lr||!form.date||!form.consignor||!form.consignee) {
      setMsg({type:'error',text:'Please fill office, LR number, date, consignor and consignee.'}); return
    }
    setLoading(true)
    const {data,error} = await supabase.from('lr_entries').insert([{
      lr_number:form.lr.trim(), office:activeOffice, date:form.date,
      consignor:form.consignor.trim(), consignee:form.consignee.trim(),
      consignor_gst:form.consignor_gst.trim()||null,
      consignee_gst:form.consignee_gst.trim()||null,
      articles:form.articles||null,
      weight_kg:form.weight?parseFloat(form.weight):null,
      particulars:form.particulars.trim()||null,
      payment_type:form.payment,
      amount:form.amount?parseFloat(form.amount):null,
      truck_number:form.truck.trim()||null,
      book_series:selectedBook||null,
      status:'booked',
      booked_at:new Date().toISOString()
    }]).select().single()
    setLoading(false)
    if (error) { setMsg({type:'error',text:error.code==='23505'?`LR ${form.lr} already exists.`:error.message}); return }
    setSaved(data)
    setMsg({type:'success',text:`LR ${form.lr} saved. Printing now...`})
    // Trigger print immediately
    setPrinting(true)
  }

  function handlePrintDone() {
    setPrinting(false)
    // Advance to next LR
    if (saved && selectedBook && officeBooks?.[selectedBook]) {
      const next = parseInt(saved.lr_number)+1
      if (next <= officeBooks[selectedBook].end) {
        setForm(f=>({...f,lr:next.toString(),consignor:'',consignor_gst:'',consignee:'',consignee_gst:'',articles:'',weight:'',particulars:'',payment:'topay',amount:'',truck:''}))
        setLRMsg({type:'info',text:`Book ${selectedBook} · Next: ${next.toLocaleString('en-IN')} · ${(officeBooks[selectedBook].end-next+1).toLocaleString('en-IN')} remaining`})
      }
    }
    setSaved(null)
    setMsg({type:'success',text:`LR printed. Ready for next entry.`})
  }

  function handleClear() {
    setForm(f=>({...f,consignor:'',consignor_gst:'',consignee:'',consignee_gst:'',articles:'',weight:'',particulars:'',payment:'topay',amount:'',truck:''}))
    setMsg(null); setSaved(null)
  }

  return (
    <div className="page">
      {/* Auto-print when triggered */}
      {printing && saved && <LRPrint lr={saved} onDone={handlePrintDone} />}

      <div style={{marginBottom:'1rem'}}>
        <h1 style={{fontSize:20,fontWeight:500}}>New LR entry</h1>
        <p style={{fontSize:13,color:'var(--text2)',marginTop:3}}>{activeOffice?`${activeOffice} → Ahmedabad`:'Select office to continue'}</p>
      </div>

      <div className="card">
        {user.office==='Admin' && (
          <div className="fg"><label>Booking office *</label>
            <select value={adminOffice} onChange={e=>{setAdminOffice(e.target.value);setSelectedBook('');setLRMsg(null);setForm(f=>({...f,lr:''}));setSaved(null);setMsg(null)}}>
              <option value="">— select —</option>
              {OFFICES.map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
        )}

        {activeOffice && <>
          <div className="office-pill">📍 {activeOffice} → Ahmedabad</div>

          <div className="g2">
            <div className="fg">
              <label>LR book</label>
              <select value={selectedBook} onChange={e=>{setSelectedBook(e.target.value);setSaved(null);setMsg(null)}}>
                <option value="">— select book —</option>
                {officeBooks&&Object.entries(officeBooks).map(([key,range])=>(
                  <option key={key} value={key}>Book {key} ({range.start.toLocaleString('en-IN')} – {range.end.toLocaleString('en-IN')})</option>
                ))}
              </select>
            </div>
            <div className="fg">
              <label>LR number *{lrLoading&&<span style={{fontSize:11,color:'var(--text2)',marginLeft:6}}>loading...</span>}</label>
              <input value={form.lr} onChange={e=>{set('lr',e.target.value);setLRMsg(null)}} placeholder={selectedBook?'Auto-filled':'Enter manually'} style={{fontWeight:selectedBook?600:400,fontSize:selectedBook?15:14}} />
              {lrMsg&&<p style={{fontSize:11,marginTop:3,color:lrMsg.type==='error'?'#993C1D':'#185FA5'}}>{lrMsg.text}</p>}
            </div>
          </div>

          <div className="fg" style={{maxWidth:200}}><label>Date *</label><input type="date" value={form.date} onChange={e=>set('date',e.target.value)} /></div>

          <div className="g2">
            <PartyInput label="Consignor (sender)" required nameValue={form.consignor} gstValue={form.consignor_gst} onNameChange={v=>set('consignor',v)} onGstChange={v=>set('consignor_gst',v)} placeholder="M/s. name" />
            <PartyInput label="Consignee (receiver)" required nameValue={form.consignee} gstValue={form.consignee_gst} onNameChange={v=>set('consignee',v)} onGstChange={v=>set('consignee_gst',v)} placeholder="M/s. name" />
          </div>

          <div className="g3">
            <div className="fg"><label>No. of articles</label><input type="number" value={form.articles} onChange={e=>set('articles',e.target.value)} placeholder="e.g. 6" /></div>
            <div className="fg"><label>Weight (kg)</label><input type="number" value={form.weight} onChange={e=>set('weight',e.target.value)} placeholder="e.g. 315" /></div>
            <div className="fg"><label>Truck number</label><input value={form.truck} onChange={e=>set('truck',e.target.value)} placeholder="e.g. MH04-AB-1234" /></div>
          </div>

          <div className="g2">
            <div className="fg"><label>Particulars</label><input value={form.particulars} onChange={e=>set('particulars',e.target.value)} placeholder="e.g. Hardware items" /></div>
            <div className="fg"><label>Payment</label>
              <select value={form.payment} onChange={e=>set('payment',e.target.value)}>
                <option value="topay">To Pay</option><option value="paid">Paid</option><option value="blank">—</option>
              </select>
            </div>
          </div>

          <div className="fg" style={{maxWidth:200}}><label>Amount (Rs.)</label><input type="number" value={form.amount} onChange={e=>set('amount',e.target.value)} placeholder="e.g. 500" /></div>

          <hr className="divider" />
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <button className="btn btn-primary" onClick={handleSave} disabled={loading||printing}>
              {loading?'Saving...':printing?'Printing...':'✓ Save LR & Print'}
            </button>
            <button className="btn" onClick={handleClear}>Clear fields</button>
            {saved && !printing && (
              <button className="btn btn-sm" onClick={()=>setPrinting(true)} style={{marginLeft:'auto'}}>
                🖨 Reprint LR {saved.lr_number}
              </button>
            )}
          </div>
          {msg&&<div className={msg.type==='success'?'msg-success':'msg-error'} style={{marginTop:10}}>{msg.text}</div>}
        </>}
      </div>
    </div>
  )
}
