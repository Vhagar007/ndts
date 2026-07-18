import { useEffect } from 'react'

// This component renders a hidden print-ready page with 2 LR slips
// and triggers window.print() automatically when mounted

export default function LRPrint({ lr, onDone }) {
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const t = setTimeout(() => {
      window.print()
      onDone?.()
    }, 300)
    return () => clearTimeout(t)
  }, [])

  const slip = (copyLabel) => `
    <div class="slip">
      <!-- LEFT COLUMN: addresses rotated -->
      <div class="left-col">
        <div class="addr-block">
          <div class="section-head">DELIVERY CENTRE :</div>
          <div class="city-name">AHMEDABAD H.O.</div>
          <div class="city-info">Old Lathi Bazar, Opp. Satkar Guest House, B/h. S.T. Stand, Ahmedabad-1. M.: 7878548055, 9512614040</div>
          <div class="city-name">NAROL :</div>
          <div class="city-info">7/B, Calico Nagar, Nr. Winsom Hotel, Narol-Sarkhej Highway, Narol, Ahmedabad. M.: 9825353344, 9377232350</div>
          <div class="city-name">PIPLEJ :</div>
          <div class="city-info">Popatkaka's Estate, Godown 1-2-3, Opp. Arco Roadways. M.: 9377837070, 9374472755</div>
          <div class="city-name">NADIAD :</div>
          <div class="city-info">Municipal Shopping Center, Opp Krishna Transport, Sherkand Talav, NADIAD. M.: 9824716010</div>
          <div class="section-head" style="margin-top:4px">BOOKING CENTER :</div>
          <div class="city-name">BHAYANDER :</div>
          <div class="city-info">Vardhman Complex, Bldg. No.1, Shop No.6, HP Gas Godown Lane, Nr. Syndicate Transport, Nr. Sports Complex, Hanuman Mandir, Bhaynder (E). M.: 9082584727</div>
          <div class="city-name">BHIWANDI :</div>
          <div class="city-info">Shreeram Complex, Gala No.C, H.No.-1252, Ground Floor, Opp. Sallony Weight Bright, Rahanal Village, Bhiwandi-421302. M.: 9867401557, 7710097904</div>
          <div class="city-name">VASAI :</div>
          <div class="city-info">Gala No.4, Rashid Compound, B/h. Om Sai Kata, Rang Office, Valiv Road, Vasai. M.: 7304393405</div>
          <div class="city-name">VAPI :</div>
          <div class="city-info">5 &amp; 6, Nirmal Chamber, Near Sayyed Paper Mill, GIDC, Vapi. M.: 9825016834</div>
        </div>
        <div class="route-text">Daily Quick Service : MUMBAI, BHAYANDER, BHIWANDI, VASAI, VAPI TO AHMEDABAD, NAROL, PIPLEJ, NADIAD, SARKHEJ DAILY SERVICE</div>
      </div>

      <!-- RIGHT COLUMN: main content -->
      <div class="right-col">

        <!-- TOP: logo area + LR number -->
        <div class="top-header">
          <div class="logo-area">
            <div class="jurisdiction">Subject to Ahmedabad Jurisdiction &nbsp;&nbsp; Transort ID : 24AIGPK7848G1Z2</div>
            <div class="brand-row">
              <svg width="28" height="30" viewBox="0 0 40 42" xmlns="http://www.w3.org/2000/svg">
                <polygon points="20,2 38,16 20,40 2,16" fill="none" stroke="#1a3a6b" stroke-width="2.5"/>
                <polygon points="20,9 31,17 20,33 9,17" fill="none" stroke="#1a3a6b" stroke-width="1.5"/>
                <line x1="2" y1="16" x2="38" y2="16" stroke="#1a3a6b" stroke-width="1"/>
                <line x1="9" y1="17" x2="31" y2="17" stroke="#1a3a6b" stroke-width="0.8"/>
                <text x="20" y="28" text-anchor="middle" font-size="6" font-weight="bold" fill="#1a3a6b">DIAMOND</text>
              </svg>
              <div class="brand-text">
                <span class="brand-new">New</span>
                <span class="brand-diamond">Diamond</span>
              </div>
            </div>
            <div class="brand-transport">TRANSPORT SERVICE</div>
            <div class="brand-fleet">FLEET OWNERS &amp; TRANSPORT CONTRACTOR</div>
            <div class="brand-addr">Old Lathi Bazar, Opp. Satkar Guest House, B/h. S. T. Stand, Ahmedabad-1. M. : 7878548055, 9512614040</div>
          </div>

          <div class="lr-box-area">
            <div class="godown-info">AHMEDABAD GODOWN : Mob. 7878548055<br>9512614040<br>BHAYANDER : Mob. 9082584727</div>
            <div class="lr-number">${lr.lr_number}</div>
          </div>
        </div>

        <!-- FIELDS ROW -->
        <div class="fields-row">
          <div class="field-group">
            <span class="field-label">Truck No.</span>
            <span class="field-line"></span>
          </div>
          <div class="field-group">
            <span class="field-label">From</span>
            <span class="field-value red">${lr.office?.toUpperCase()}</span>
          </div>
          <div class="field-group">
            <span class="field-label">To</span>
            <span class="field-value">AHMEDABAD</span>
          </div>
          <div class="field-group">
            <span class="field-label">Date</span>
            <span class="field-value">${formatDate(lr.date)}</span>
          </div>
        </div>
        <div class="fields-row">
          <div class="field-group wide">
            <span class="field-label">Consignor M/s.</span>
            <span class="field-value">${lr.consignor}</span>
          </div>
          <div class="field-group wide">
            <span class="field-label">Consignee M/s.</span>
            <span class="field-value">${lr.consignee}</span>
          </div>
        </div>
        <div class="fields-row gst-row">
          <div class="field-group wide">
            <span class="field-label">GST No.</span>
            <span class="field-value">${lr.consignor_gst || ''}</span>
          </div>
          <div class="field-group wide">
            <span class="field-label">GST No.</span>
            <span class="field-value">${lr.consignee_gst || ''}</span>
          </div>
        </div>

        <!-- MAIN TABLE -->
        <div class="main-table">
          <div class="col-art">
            <div class="col-head">Article<br>No.</div>
            <div class="col-body">${lr.articles || ''}</div>
          </div>
          <div class="col-part">
            <div class="col-head">Particulars</div>
            <div class="col-body">${lr.particulars || ''}</div>
          </div>
          <div class="col-kg">
            <div class="col-head">K.G.</div>
            <div class="col-body">${lr.weight_kg || ''}</div>
          </div>
          <div class="col-amount">
            <div class="col-head">Amount</div>
            <div class="col-subhead"><span>Rs.</span><span>Ps.</span></div>
            <div class="col-body-split">
              <span>${lr.payment_type === 'paid' && lr.amount ? Math.floor(lr.amount) : ''}</span>
              <span>${lr.payment_type === 'paid' && lr.amount ? '00' : ''}</span>
            </div>
          </div>
          <div class="col-topay">
            <div class="col-head">To Pay</div>
            <div class="col-body">${lr.payment_type === 'topay' ? (lr.amount || '') : ''}</div>
          </div>
        </div>

        <!-- CHARGES + DISCLAIMER -->
        <div class="bottom-row">
          <div class="disclaimer">
            <div class="copy-label">${copyLabel}</div>
            <div class="disclaimer-text">
              Damage, Breakage &amp; Leakage are at owner risk<br>
              <strong>Booked at owner's Risk</strong><br>
              <strong>CONTENTS NOT CHECKED</strong>
            </div>
          </div>
          <div class="charges">
            <div class="charge-row"><span class="c-label">GST</span><span class="c-rs"></span><span class="c-ps"></span></div>
            <div class="charge-row"><span class="c-label">Service Ch.</span><span class="c-rs"></span><span class="c-ps"></span></div>
            <div class="charge-row"><span class="c-label">B.C.</span><span class="c-rs">5</span><span class="c-ps">00</span></div>
            <div class="charge-row"><span class="c-label">Hamali</span><span class="c-rs"></span><span class="c-ps"></span></div>
            <div class="charge-row"><span class="c-label">Damrage</span><span class="c-rs"></span><span class="c-ps"></span></div>
            <div class="charge-row total-row"><span class="c-label"><strong>TOTAL</strong></span><span class="c-rs"></span><span class="c-ps"></span></div>
          </div>
        </div>

        <!-- REMARKS -->
        <div class="remarks-row">
          <div class="remark-field"><span class="field-label">Remarks</span><span class="remark-line"></span></div>
          <div class="remark-field"><span class="field-label">DELIVERY BY</span><span class="remark-line"></span></div>
          <span class="for-ndts">For, New Diamond Transport Service</span>
        </div>

      </div>
    </div>
  `

  const formatDateFn = `
    function formatDate(s) {
      if (!s) return '';
      const d = new Date(s);
      return d.getDate().toString().padStart(2,'0') + '/' + (d.getMonth()+1).toString().padStart(2,'0') + '/' + d.getFullYear();
    }
  `

  function formatDate(s) {
    if (!s) return ''
    const d = new Date(s)
    return d.getDate().toString().padStart(2,'0') + '/' + (d.getMonth()+1).toString().padStart(2,'0') + '/' + d.getFullYear()
  }

  const copyLabel = lr.book_series === 'B' ? "Driver Copy" : "Consignee's Copy"

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>LR ${lr.lr_number} - New Diamond Transport</title>
<style>
  @page { size: A4 portrait; margin: 4mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; background: white; }

  .page { width: 202mm; display: flex; flex-direction: column; gap: 0; }

  .slip {
    width: 202mm;
    height: 141mm;
    display: flex;
    flex-direction: row;
    border: 1.2px solid #1a3a6b;
    overflow: hidden;
  }

  .slip + .slip { border-top: none; }

  /* LEFT COLUMN */
  .left-col {
    width: 28mm;
    border-right: 1px solid #1a3a6b;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex-shrink: 0;
  }

  .addr-block {
    flex: 1;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font-size: 4.2pt;
    line-height: 1.35;
    padding: 3px 2px;
    overflow: hidden;
  }

  .section-head { font-weight: 800; font-size: 4.8pt; color: #cc0000; display: block; }
  .city-name { font-weight: 700; font-size: 4.2pt; color: #000; display: block; margin-top: 2px; }
  .city-info { font-size: 3.8pt; color: #333; display: block; }

  .route-text {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font-size: 3.8pt;
    font-weight: 700;
    color: #1a3a6b;
    text-align: center;
    padding: 2px 1px;
    border-top: 1px solid #1a3a6b;
    flex-shrink: 0;
    height: 28mm;
    line-height: 1.3;
  }

  /* RIGHT COLUMN */
  .right-col { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

  /* TOP HEADER */
  .top-header {
    display: flex;
    border-bottom: 1px solid #1a3a6b;
    flex-shrink: 0;
  }

  .logo-area {
    flex: 1;
    padding: 3px 5px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-right: 1px solid #1a3a6b;
  }

  .jurisdiction { font-size: 4pt; color: #555; align-self: flex-start; margin-bottom: 2px; }

  .brand-row { display: flex; align-items: center; gap: 5px; }
  .brand-text { display: flex; flex-direction: column; }
  .brand-new { font-size: 5pt; color: #888; font-style: italic; line-height: 1; }
  .brand-diamond { font-size: 16pt; font-weight: 700; color: #1a3a6b; font-family: 'Times New Roman', serif; line-height: 1; }
  .brand-transport { font-size: 7pt; font-weight: 700; color: #cc0000; letter-spacing: 0.5px; margin-top: 1px; }
  .brand-fleet { font-size: 4pt; color: #333; margin-top: 1px; }
  .brand-addr { font-size: 4pt; color: #444; text-align: center; margin-top: 2px; line-height: 1.3; }

  .lr-box-area {
    width: 38mm;
    padding: 3px 4px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex-shrink: 0;
  }

  .godown-info { font-size: 4pt; color: #333; line-height: 1.5; margin-bottom: 3px; }

  .lr-number {
    border: 1.5px solid #1a3a6b;
    font-size: 14pt;
    font-weight: 700;
    color: #1a3a6b;
    padding: 2px 6px;
    letter-spacing: 0.5px;
    text-align: center;
    width: 100%;
  }

  /* FIELDS */
  .fields-row {
    display: flex;
    align-items: baseline;
    padding: 2px 4px;
    gap: 4px;
    border-bottom: 0.5px solid #ddd;
    flex-shrink: 0;
  }

  .field-group { display: flex; align-items: baseline; gap: 2px; flex: 1; }
  .field-group.wide { flex: 2; }
  .field-label { font-size: 5pt; font-weight: 700; white-space: nowrap; color: #000; }
  .field-line { flex: 1; border-bottom: 0.5px solid #555; min-height: 9px; }
  .field-value { flex: 1; border-bottom: 0.5px solid #555; min-height: 9px; font-size: 6pt; font-weight: 700; padding: 0 2px; color: #111; }
  .field-value.red { color: #cc0000; font-weight: 800; }
  .gst-row { border-bottom: 1px solid #1a3a6b; }

  /* TABLE */
  .main-table {
    display: flex;
    flex: 1;
    border-bottom: 1px solid #1a3a6b;
    min-height: 0;
  }

  .col-art { width: 12mm; border-right: 1px solid #1a3a6b; display: flex; flex-direction: column; }
  .col-part { flex: 1; border-right: 1px solid #1a3a6b; display: flex; flex-direction: column; }
  .col-kg { width: 15mm; border-right: 1px solid #1a3a6b; display: flex; flex-direction: column; }
  .col-amount { width: 28mm; border-right: 1px solid #1a3a6b; display: flex; flex-direction: column; }
  .col-topay { width: 14mm; display: flex; flex-direction: column; }

  .col-head {
    text-align: center;
    font-weight: 700;
    font-size: 5pt;
    border-bottom: 1px solid #1a3a6b;
    padding: 2px 1px;
    flex-shrink: 0;
    line-height: 1.3;
  }

  .col-subhead {
    display: flex;
    border-bottom: 1px solid #1a3a6b;
    flex-shrink: 0;
  }
  .col-subhead span {
    flex: 1;
    text-align: center;
    font-size: 4.5pt;
    font-weight: 700;
    padding: 1px;
    border-right: 0.5px solid #1a3a6b;
  }
  .col-subhead span:last-child { border-right: none; }

  .col-body {
    flex: 1;
    padding: 3px 3px;
    font-size: 6.5pt;
    font-weight: 700;
    color: #111;
    text-align: center;
  }

  .col-part .col-body { text-align: left; font-size: 7pt; }

  .col-body-split {
    flex: 1;
    display: flex;
  }
  .col-body-split span {
    flex: 1;
    text-align: center;
    padding: 3px 2px;
    font-size: 7pt;
    font-weight: 700;
    border-right: 0.5px solid #1a3a6b;
  }
  .col-body-split span:last-child { border-right: none; }

  /* BOTTOM */
  .bottom-row {
    display: flex;
    border-bottom: 1px solid #1a3a6b;
    flex-shrink: 0;
    min-height: 22mm;
  }

  .disclaimer {
    flex: 1;
    border-right: 1px solid #1a3a6b;
    padding: 3px 5px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .copy-label { font-size: 9pt; font-weight: 700; color: #cc0000; font-style: italic; margin-bottom: 3px; }
  .disclaimer-text { font-size: 4.5pt; color: #333; line-height: 1.6; }

  .charges { width: 45mm; flex-shrink: 0; }

  .charge-row {
    display: flex;
    border-bottom: 0.5px solid #1a3a6b;
    align-items: stretch;
  }
  .charge-row:last-child { border-bottom: none; }

  .c-label { flex: 1; font-size: 4.5pt; font-weight: 700; color: #cc0000; padding: 1.5px 3px; border-right: 0.5px solid #1a3a6b; }
  .total-row .c-label { color: #000; }
  .c-rs { width: 16mm; border-right: 0.5px solid #1a3a6b; font-size: 5pt; padding: 1.5px 2px; text-align: right; }
  .c-ps { width: 10mm; font-size: 5pt; padding: 1.5px 2px; text-align: right; }

  /* REMARKS */
  .remarks-row {
    display: flex;
    align-items: center;
    padding: 2px 4px;
    gap: 6px;
    flex-shrink: 0;
  }
  .remark-field { display: flex; align-items: baseline; gap: 3px; flex: 1; }
  .remark-line { flex: 1; border-bottom: 0.5px solid #555; min-height: 9px; }
  .for-ndts { font-size: 5pt; font-weight: 700; white-space: nowrap; color: #000; }

  /* CUT LINE between slips */
  .cut-line {
    width: 100%;
    border: none;
    border-top: 1px dashed #aaa;
    margin: 0;
  }
</style>
</head>
<body>
<div class="page">
  ${slip("Consignee's Copy")}
  ${slip("Driver Copy")}
</div>
</body>
</html>`

  // Open print window
  const printWin = window.open('', '_blank', 'width=900,height=700')
  if (printWin) {
    printWin.document.write(html)
    printWin.document.close()
    printWin.focus()
    setTimeout(() => {
      printWin.print()
      printWin.close()
      onDone?.()
    }, 500)
  }

  // Return nothing visible — this component is purely functional
  return null
}
