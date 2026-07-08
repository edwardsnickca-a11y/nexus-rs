import { useState } from 'react'
import { MATRIX } from '../data/syncMatrix.js'
const HOURS = Array.from({length:17},(_,i)=>i+6)
const ROWS = ['MQ-9','LUH-72','CAP','DoD Partner Asset','Forest Service Asset','BLM Asset','State Partner Asset','Contract Collection Asset','Satellite Source']
export default function SyncMatrix(){
  const [selected,setSelected]=useState(MATRIX.sorties[0])
  const left=(s)=>`${((s.start-6)/16)*100}%`
  const width=(s)=>`${((s.end-s.start)/16)*100}%`
  return <div className="sync-grid">
    <section className="panel matrix"><div className="matrix-title"><div><span className="eyebrow">Regional Multi-Fire Sync Matrix</span><h3>{MATRIX.operationalPeriod} · {MATRIX.date}</h3><p>Local Incident Time — Pacific Time · As of {MATRIX.asOf} · Version {MATRIX.version}</p></div><span className="chip amber">{MATRIX.status}</span></div>
    <div className="deadlines">{MATRIX.deadlines.map(([k,v])=><span key={k}>{k} <strong>{v}</strong></span>)}</div>
    <div className="timeline-scroll"><div className="timeline"><div className="times">{HOURS.map(h=><span key={h}>{String(h).padStart(2,'0')}00</span>)}</div>{ROWS.map(row=><div className="timeline-row" key={row}><div className="asset">{row}</div><div className="track">{MATRIX.sorties.filter(s=>s.asset===row).map(s=><button key={s.id} className={`sortie ${s.protected?'protected':''}`} style={{left:left(s),width:width(s)}} onClick={()=>setSelected(s)}><strong>{s.identifier}</strong><span>{String(s.start).padStart(2,'0')}00–{String(s.end).padStart(2,'0')}00</span><small>{s.fire} · {s.requirement}</small></button>)}</div></div>)}</div></div></section>
    <aside className="panel detail"><div className="panel-head"><h3>Sortie Detail</h3><span className="chip teal">{selected.protected?'PROTECTED':'STANDARD'}</span></div>{Object.entries({Asset:selected.identifier,Area:selected.fire,Requirement:selected.requirement,Window:`${String(selected.start).padStart(2,'0')}00–${String(selected.end).padStart(2,'0')}00 Local`,'Assigned UPAD':selected.upad}).map(([k,v])=><div className="detail-row" key={k}><span>{k}</span><strong>{v}</strong></div>)}</aside>
    <section className="support full"><article className="panel"><div className="panel-head"><h3>Unmet Needs</h3><span className="chip red">1 OPEN</span></div><strong>REQ-024 · Fire Charlie</strong><p>1400–1700 Local · No NEXUS-controlled asset available.</p><small>Decision deadline: 1230 Local</small></article><article className="panel"><div className="panel-head"><h3>Coverage Gaps</h3><span className="chip amber">1 AT RISK</span></div><strong>Fire Alpha · 1300–1600 Local</strong><p>Loss of persistent coverage during evacuation window.</p></article><article className="panel"><div className="panel-head"><h3>Partner Assets</h3><span className="chip slate">CONTROLLED DATA</span></div><p>US Forest Service Asset · 1100–1600 Local</p><p>BLM Asset · 1400–1800 Local</p></article><article className="panel"><div className="panel-head"><h3>Airspace / TFR</h3><span className="chip amber">ACTION</span></div><strong>Fire Bravo</strong><p>LUH-72 coordination update due 1045 Local.</p></article></section>
  </div>
}
