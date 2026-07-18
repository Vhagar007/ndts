import { useEffect } from 'react'

function fmt(s) {
  if (!s) return ''
  const d = new Date(s)
  return d.getDate().toString().padStart(2,'0') + '/' + (d.getMonth()+1).toString().padStart(2,'0') + '/' + d.getFullYear()
}

function slip(lr, label) {
  const rs = lr.payment_type==='paid'&&lr.amount ? Math.floor(lr.amount) : ''
  const ps = lr.payment_type==='paid'&&lr.amount ? '00' : ''
  const tp = lr.payment_type==='topay'&&lr.amount ? lr.amount : ''
  const office = (lr.office||'').toUpperCase()
  return `<div class="slip">
  <div class="lc">
    <div class="dh">DELIVERY CENTRE :</div>
    <div class="cn">AHMEDABAD H.O.</div>
    <div class="ci">Old Lathi Bazar, Opp. Satkar Guest House,<br>B/h. S. T. Stand, Ahmedabad-1.<br>M. : 7878548055, 9512614040</div>
    <div class="cn">NAROL :</div>
    <div class="ci">7/B, Calico Nagar, Nr. Winsom Hotel, Narol - Sarkhej Highway, Narol, Ahmedabad.<br>M. : 9825353344, 9377232350</div>
    <div class="cn">PIPLEJ :</div>
    <div class="ci">Popatkaka's Estate, Godown 1-2-3, Opp. Arco Roadways.<br>M. : 9377837070, 9374472755</div>
    <div class="cn">NADIAD :</div>
    <div class="ci">Municipal Shopping Center, Opp Krishna Transport, Sherkand Talav, NADIAD.<br>M. : 9824716010</div>
    <div class="dh">BOOKING CENTER :</div>
    <div class="cn">BHAYANDER :</div>
    <div class="ci">Vardhman Complex, Bldg. No.1, Shop No. 6, HP Gas Godown Lane, Nr. Syndicate Transport, Nr. Sports Complex, Hanuman Mandir, Bhaynder (E).<br>M. : 9082584727</div>
    <div class="cn">BHIWANDI :</div>
    <div class="ci">Shreeram Complex, Gala No. C, H. No - 1252, Ground Floor, Opp. Sallony Weight Bright, Rahanal Village, Bhiwandi-421302.<br>M. : 9867401557, 7710097904</div>
    <div class="cn">VASAI :</div>
    <div class="ci">Gala No. 4, Rashid Compound, B/h. Om Sai Kata, Rang Office, Valiv Road, Vasai.<br>M. : 7304393405</div>
    <div class="cn">VAPI :</div>
    <div class="ci">5 &amp; 6, Nirmal Chamber, Near Sayyed Paper Mill, GIDC, Vapi.<br>M. : 9825016834</div>
  </div>
  <div class="rc">
    <div class="hdr">
      <div class="bc">
        <div class="jur">Subject to Ahmedabad Jurisdiction &nbsp; Transort ID : 24AIGPK7848G1Z2</div>
        <div class="br">
          <svg width="34" height="36" viewBox="0 0 50 52" xmlns="http://www.w3.org/2000/svg">
            <polygon points="25,3 47,19 25,49 3,19" fill="none" stroke="#1a3a6b" stroke-width="2.5"/>
            <polygon points="25,11 39,21 25,41 11,21" fill="none" stroke="#1a3a6b" stroke-width="1.8"/>
            <line x1="3" y1="19" x2="47" y2="19" stroke="#1a3a6b" stroke-width="1.2"/>
            <line x1="11" y1="21" x2="39" y2="21" stroke="#1a3a6b" stroke-width="0.9"/>
            <text x="25" y="34" text-anchor="middle" font-size="7" font-weight="bold" fill="#1a3a6b">DIAMOND</text>
          </svg>
          <div><span class="bnew">New</span><span class="bdiam">Diamond</span></div>
        </div>
        <div class="bts">TRANSPORT SERVICE</div>
        <div class="bfl">FLEET OWNERS &amp; TRANSPORT CONTRACTOR</div>
        <div class="bad">Old Lathi Bazar, Opp. Satkar Guest House, B/h. S. T. Stand, Ahmedabad-1. M. : 7878548055, 9512614040</div>
      </div>
      <div class="tr">
        <div class="gc">AHMEDABAD GODOWN : Mob. 7878548055<br>9512614040<br>BHAYANDER : Mob. 9082584727</div>
        <div class="lrn">${lr.lr_number}</div>
      </div>
    </div>
    <div class="fs">
      <div class="fr1">
        <div class="fi"><span class="fl">Truck No.</span><span class="fv"></span></div>
        <div class="fi"><span class="fl">From</span><span class="fv red">${office}</span></div>
        <div class="fi"><span class="fl">To</span><span class="fv">AHMEDABAD</span></div>
        <div class="fi"><span class="fl">Date</span><span class="fv">${fmt(lr.date)}</span></div>
      </div>
      <div class="fr2">
        <div class="fh"><span class="fl">Consignor M/s.</span><span class="fv">${lr.consignor||''}</span></div>
        <div class="fh"><span class="fl">Consignee M/s.</span><span class="fv">${lr.consignee||''}</span></div>
      </div>
      <div class="fr3">
        <div class="fh"><span class="fl">GST No.</span><span class="fv">${lr.consignor_gst||''}</span></div>
        <div class="fh"><span class="fl">GST No.</span><span class="fv">${lr.consignee_gst||''}</span></div>
      </div>
    </div>
    <div class="mt">
      <div class="ca"><div class="th">Article<br>No.</div><div class="td c">${lr.articles||''}</div></div>
      <div class="cp"><div class="th">Particulars</div><div class="td"><div class="pc">${lr.particulars||''}</div><div class="cl">${label}</div></div></div>
      <div class="ck"><div class="th">K. G.</div><div class="td c">${lr.weight_kg||''}</div></div>
      <div class="cam">
        <div class="th">Amount</div>
        <div class="ths"><span class="tsh">Rs.</span><span class="tsh">Ps.</span></div>
        <div class="tds"><span class="hv">${rs}</span><span class="hv">${ps}</span></div>
      </div>
      <div class="ctp"><div class="th">To Pay</div><div class="td c">${tp}</div></div>
      <div class="cch">
        <div class="cr"><span class="cl2">GST</span><span class="crs"></span><span class="cps"></span></div>
        <div class="cr"><span class="cl2">Service Ch.</span><span class="crs"></span><span class="cps"></span></div>
        <div class="cr"><span class="cl2">B.C.</span><span class="crs">5</span><span class="cps">00</span></div>
        <div class="cr"><span class="cl2">Hamali</span><span class="crs"></span><span class="cps"></span></div>
        <div class="cr"><span class="cl2">Damrage</span><span class="crs"></span><span class="cps"></span></div>
        <div class="cr ctot"><span class="cl2"><b>TOTAL</b></span><span class="crs"></span><span class="cps"></span></div>
      </div>
    </div>
    <div class="dr">
      <div class="dt">Damage, Breakage &amp; Leakage are at owner risk<br><b>Booked at owner's Risk</b><br><b>CONTENTS NOT CHECKED</b></div>
      <div class="fn">For, New Diamond Transport Service</div>
    </div>
    <div class="rmr">
      <div class="ri"><span class="fl">Remarks</span><span class="rl"></span></div>
      <div class="ri"><span class="fl">DELIVERY BY</span><span class="rl"></span></div>
    </div>
    <div class="rt">Daily Quick Service : <b>MUMBAI, BHAYANDER, BHIWANDI, VASAI, VAPI TO AHMEDABAD, NAROL, PIPLEJ, NADIAD, SARKHEJ DAILY SERVICE</b></div>
  </div>
</div>`
}

function buildHTML(lr) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>LR ${lr.lr_number}</title>
<style>
@page{size:A4 portrait;margin:3mm}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;font-size:8pt;background:white;color:#000}
.page{width:204mm}
.slip{width:204mm;height:142mm;display:flex;flex-direction:row;border:1.2px solid #000;overflow:hidden;page-break-inside:avoid}
.slip+.slip{border-top:none}
.lc{width:43mm;border-right:1px solid #000;padding:3px 3px;flex-shrink:0;overflow:hidden}
.dh{font-weight:800;font-size:6.5pt;color:#000;margin-top:3px}
.cn{font-weight:700;font-size:6pt;margin-top:2px}
.ci{font-size:5pt;line-height:1.35;color:#000}
.rc{flex:1;display:flex;flex-direction:column;overflow:hidden}
.hdr{display:flex;border-bottom:1px solid #000;flex-shrink:0}
.bc{flex:1;padding:3px 5px;border-right:1px solid #000;display:flex;flex-direction:column;align-items:center}
.jur{font-size:4.5pt;color:#333;align-self:flex-start;margin-bottom:2px;line-height:1.4}
.br{display:flex;align-items:center;gap:4px}
.bnew{font-size:5pt;color:#888;font-style:italic;display:block;line-height:1}
.bdiam{font-size:18pt;font-weight:700;color:#1a3a6b;font-family:'Times New Roman',serif;line-height:1;display:block}
.bts{font-size:9pt;font-weight:700;color:#000;letter-spacing:1px;margin-top:1px;text-decoration:underline}
.bfl{font-size:5.5pt;font-weight:700;color:#000;margin-top:1px}
.bad{font-size:4.5pt;color:#000;text-align:center;margin-top:1px;line-height:1.3}
.tr{width:47mm;padding:3px 4px;flex-shrink:0;display:flex;flex-direction:column}
.gc{font-size:5.5pt;line-height:1.5;margin-bottom:3px}
.lrn{border:1.5px solid #000;font-size:15pt;font-weight:700;padding:2px 4px;text-align:center;width:100%;letter-spacing:0.5px}
.fs{border-bottom:1px solid #000;flex-shrink:0}
.fr1,.fr2,.fr3{display:flex;padding:2px 4px;gap:4px;border-bottom:0.5px solid #ccc}
.fr3{border-bottom:1px solid #000}
.fi{display:flex;align-items:baseline;gap:2px;flex:1}
.fh{display:flex;align-items:baseline;gap:2px;flex:1}
.fl{font-size:6pt;font-weight:700;white-space:nowrap}
.fv{flex:1;border-bottom:0.5px solid #555;min-height:10px;font-size:7pt;font-weight:700;padding:0 2px}
.red{color:#cc0000;font-size:7.5pt}
.mt{display:flex;flex:1;border-bottom:1px solid #000;min-height:0}
.ca{width:13mm;border-right:1px solid #000;display:flex;flex-direction:column;flex-shrink:0}
.cp{flex:1;border-right:1px solid #000;display:flex;flex-direction:column}
.ck{width:16mm;border-right:1px solid #000;display:flex;flex-direction:column;flex-shrink:0}
.cam{width:27mm;border-right:1px solid #000;display:flex;flex-direction:column;flex-shrink:0}
.ctp{width:15mm;border-right:1px solid #000;display:flex;flex-direction:column;flex-shrink:0}
.cch{width:38mm;display:flex;flex-direction:column;flex-shrink:0}
.th{text-align:center;font-weight:700;font-size:6pt;border-bottom:1px solid #000;padding:2px 1px;flex-shrink:0;line-height:1.3}
.ths{display:flex;border-bottom:1px solid #000;flex-shrink:0}
.tsh{flex:1;text-align:center;font-size:5.5pt;font-weight:700;padding:1px;border-right:0.5px solid #000}
.tsh:last-child{border-right:none}
.td{flex:1;padding:3px;font-size:7pt;font-weight:700}
.td.c{text-align:center}
.pc{font-size:7pt;font-weight:700}
.cl{font-family:'Times New Roman',serif;font-size:13pt;font-style:italic;font-weight:700;margin-top:6px;padding-left:2px}
.tds{flex:1;display:flex}
.hv{flex:1;text-align:center;padding:3px 2px;font-size:7pt;font-weight:700;border-right:0.5px solid #000}
.hv:last-child{border-right:none}
.cr{display:flex;border-bottom:0.5px solid #000;align-items:stretch;flex-shrink:0}
.cr:last-child{border-bottom:none}
.cl2{flex:1;font-size:5pt;font-weight:700;padding:1.5px 3px;border-right:0.5px solid #000}
.crs{width:14mm;border-right:0.5px solid #000;font-size:5.5pt;padding:1.5px 2px;text-align:right}
.cps{width:9mm;font-size:5.5pt;padding:1.5px 2px;text-align:right}
.ctot{background:#f5f5f5}
.dr{display:flex;justify-content:space-between;align-items:flex-end;padding:2px 4px;border-bottom:0.5px solid #000;flex-shrink:0}
.dt{font-size:5.5pt;line-height:1.5}
.fn{font-size:5.5pt;font-weight:700;text-align:right}
.rmr{display:flex;gap:8px;padding:2px 4px;border-bottom:0.5px solid #000;flex-shrink:0}
.ri{display:flex;align-items:baseline;gap:3px;flex:1}
.rl{flex:1;border-bottom:0.5px solid #555;min-height:10px}
.rt{font-size:5.8pt;text-align:center;padding:2px 4px;line-height:1.6;flex-shrink:0}
</style>
</head><body>
<div class="page">
${slip(lr,'Driver Copy')}
${slip(lr,'Driver Copy')}
</div>
</body></html>`
}

export default function LRPrint({ lr, onDone }) {
  useEffect(() => {
    const html = buildHTML(lr)
    const w = window.open('','_blank','width=900,height=700')
    if (w) {
      w.document.write(html)
      w.document.close()
      w.focus()
      setTimeout(() => { w.print(); w.close(); onDone?.() }, 600)
    } else { onDone?.() }
  }, [])
  return null
}
