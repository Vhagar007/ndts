import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase, OFFICES, fmtDate, fmtDT } from '../lib/supabase'
const STEPS = [
  {key:'booked_at',label:l=>`Booked at ${l.office}`},
  {key:'dispatched_at',label:l=>`Dispatched from ${l.office}`},
  {key:'arrived_at',label:()=>'Arrived at Ahmedabad'},
  {key:'delivered_at',label:l=>`Delivered to ${l.consignee}`},
]
export default function Track() {
  const {office:paramOffice,lr:paramLR}=useParams()
  const navigate=useNavigate()
  const [office,setOffice]=useState(paramOffice||'')
  const [lr,setLR]=useState(paramLR||'')
  const [result,setResult]=useState(null)
  const [loading,setLoading]=useState(false)
  const [msg,setMsg]=useState(null)
  useEffect(()=>{if(paramOffice&&paramLR)doTrack(paramOffice,paramLR)},[paramOffice,paramLR])
  async function doTrack(o,l){
    const sO=o||office;const sL=l||lr
    if(!sL.trim()){setMsg('Enter an LR number.');return}
    setLoading(true);setMsg(null);setResult(null)
    let q=supabase.from('lr_entries').select('*').eq('lr_number',sL.trim())
    if(sO)q=q.eq('office',sO)
    const{data}=await q;setLoading(false)
    if(!data||!data.length){setMsg('No parcel found.');return}
    setResult(data)
    if(!paramOffice)navigate(`/track/${data[0].office}/${sL.trim()}`,{replace:true})
  }
  const sBg={booked:'#E6F1FB',transit:'#FAEEDA',arrived:'#E1F5EE',delivered:'#F1EFE8'}
  const sCol={booked:'#185FA5',transit:'#854F0B',arrived:'#0F6E56',delivered:'#5F5E5A'}
  const sLabel={booked:'Booked',transit:'In transit',arrived:'Arrived Ahmedabad',delivered:'Delivered'}
  return(
    <div style={{minHeight:'100vh',background:'var(--bg3)',padding:'2rem 1rem'}}>
      <div style={{maxWidth:560,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:'1.5rem'}}>
          <p style={{fontSize:13,color:'var(--text2)',marginBottom:4}}>New Diamond Transport Service</p>
          <h1 style={{fontSize:22,fontWeight:600}}>Track your parcel</h1>
        </div>
        <div className="card">
          <div className="fg"><label>Booking office</label><select value={office} onChange={e=>setOffice(e.target.value)}><option value="">Any office</option>{OFFICES.map(o=><option key={o}>{o}</option>)}</select></div>
          <div className="fg"><label>LR number *</label><input value={lr} onChange={e=>setLR(e.target.value)} placeholder="e.g. 100001" onKeyDown={e=>e.key==='Enter'&&doTrack()}/></div>
          <button className="btn btn-primary btn-full" onClick={()=>doTrack()} disabled={loading}>{loading?'Searching...':'→ Track parcel'}</button>
          {msg&&<p style={{fontSize:13,color:'var(--text2)',marginTop:10,textAlign:'center'}}>{msg}</p>}
        </div>
        {result&&result.map(l=>{
          const doneCount=STEPS.filter(s=>l[s.key]).length
          return<div key={l.id} className="card" style={{marginTop:12}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
              <div><p style={{fontSize:16,fontWeight:600}}>LR {l.lr_number}</p><p style={{fontSize:13,color:'var(--text2)',marginTop:2}}>{l.office} → Ahmedabad</p></div>
              <span className="badge" style={{background:sBg[l.status],color:sCol[l.status]}}>{sLabel[l.status]}</span>
            </div>
            <div style={{background:'var(--bg2)',borderRadius:8,padding:'10px 14px',marginBottom:12,fontSize:13}}>
              <div className="g2" style={{gap:8}}>
                <div><span style={{color:'var(--text2)'}}>Consignee</span><br/><strong>{l.consignee}</strong></div>
                <div><span style={{color:'var(--text2)'}}>Booked on</span><br/><strong>{fmtDate(l.date)}</strong></div>
                {l.particulars&&<div><span style={{color:'var(--text2)'}}>Contents</span><br/><strong>{l.particulars}</strong></div>}
                {l.weight_kg&&<div><span style={{color:'var(--text2)'}}>Weight</span><br/><strong>{l.weight_kg} kg</strong></div>}
              </div>
            </div>
            {STEPS.map((step,i)=>{const done=!!l[step.key];const isActive=!done&&i===doneCount;return(
              <div key={step.key} style={{display:'flex',gap:12,padding:'7px 0'}}>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                  <div style={{width:10,height:10,borderRadius:'50%',background:done?'#1D9E75':isActive?'#378ADD':'var(--border2)',flexShrink:0}}/>
                  {i<STEPS.length-1&&<div style={{width:1,flex:1,background:'var(--border)',minHeight:16}}/>}
                </div>
                <div style={{flex:1,paddingBottom:4}}>
                  <div style={{fontSize:13,fontWeight:500,color:done?'var(--text)':isActive?'var(--text)':'var(--text3)'}}>{step.label(l)}</div>
                  <div style={{fontSize:12,color:'var(--text2)',marginTop:1}}>{done?fmtDT(l[step.key]):isActive?'In progress':'Pending'}</div>
                </div>
              </div>
            )})}
            {l.status==='delivered'&&l.receiver_name&&<p style={{fontSize:12,color:'#0F6E56',marginTop:8,padding:'6px 10px',background:'#E1F5EE',borderRadius:6}}>✓ Received by {l.receiver_name}</p>}
          </div>
        })}
        <p style={{fontSize:12,color:'var(--text3)',textAlign:'center',marginTop:'1.5rem'}}>New Diamond Transport Service · 7878548055, 9512614040</p>
      </div>
    </div>
  )
}
