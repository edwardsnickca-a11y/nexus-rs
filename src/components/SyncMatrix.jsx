import { useMemo, useState } from 'react'

const HOURS = Array.from({length:17},(_,i)=>i+6)
const ROWS = ['MQ-9','LUH-72','CAP','DoD Partner Asset','Forest Service Asset','BLM Asset','State Partner Asset','Contract Collection Asset','Satellite Source']

const PERMISSIONS = {
  remote_sensing_coordinator: { sorties: false, requirements: false, upad: false, gaps: true, approval: true, note: 'Regional integration, partner coordination, gap resolution, and approval.' },
  remote_sensing_manager: { sorties: true, requirements: false, upad: false, gaps: true, approval: false, note: 'Execution accuracy, sortie changes, retasks, and mission status.' },
  collection_manager: { sorties: false, requirements: true, upad: false, gaps: true, approval: false, note: 'Requirement, EEI, taskability, and alternate-source linkage.' },
  upad_lno: { sorties: false, requirements: false, upad: true, gaps: false, approval: false, note: 'UPAD assignment, product status, delivery risk, and handoff.' },
}

export default function SyncMatrix({ role, matrix, onUpdateSortie, onResolveNeed, onResolveGap, onApprove, onAddLeadershipNote }){
  const [selectedId,setSelectedId]=useState(matrix.sorties[0]?.id)
  const [note,setNote]=useState('')
  const selected=matrix.sorties.find(s=>s.id===selectedId) || matrix.sorties[0]
  const permission=PERMISSIONS[role] || PERMISSIONS.remote_sensing_coordinator
  const left=(s)=>`${((s.start-6)/16)*100}%`
  const width=(s)=>`${((s.end-s.start)/16)*100}%`
  const entriesByAsset=useMemo(()=>Object.fromEntries(ROWS.map(row=>[row,matrix.sorties.filter(s=>s.asset===row)])),[matrix.sorties])

  const update=(field,value)=>onUpdateSortie(selected.id,{[field]:value})

  return <div className="sync-grid stateful-sync">
    <section className="panel matrix">
      <div className="matrix-title"><div><span className="eyebrow">Regional Multi-Fire Sync Matrix</span><h3>{matrix.operationalPeriod} · {matrix.date}</h3><p>Local Incident Time — Pacific Time · As of {matrix.asOf} · Version {matrix.version}</p></div><div className="matrix-actions"><span className="chip amber">{matrix.status}</span><span className={`chip ${matrix.coordinatorApprovalStatus==='approved'?'teal':'slate'}`}>COORDINATOR {matrix.coordinatorApprovalStatus.toUpperCase()}</span></div></div>
      <div className="authority-banner"><strong>Role Authority:</strong> {permission.note}</div>
      <div className="deadlines">{matrix.deadlines.map(([k,v])=><span key={k}>{k} <strong>{v}</strong></span>)}</div>
      <div className="timeline-scroll"><div className="timeline"><div className="times">{HOURS.map(h=><span key={h}>{String(h).padStart(2,'0')}00</span>)}</div>{ROWS.map(row=><div className="timeline-row" key={row}><div className="asset">{row}</div><div className="track">{entriesByAsset[row].map(s=><button key={s.id} className={`sortie ${s.protected?'protected':''} ${selectedId===s.id?'selected-sortie':''}`} style={{left:left(s),width:width(s)}} onClick={()=>setSelectedId(s.id)}><strong>{s.identifier}</strong><span>{String(s.start).padStart(2,'0')}00–{String(s.end).padStart(2,'0')}00</span><small>{s.fire} · {s.requirement}</small></button>)}</div></div>)}</div></div>
    </section>

    <aside className="panel detail">
      <div className="panel-head"><h3>Sortie Detail</h3><span className="chip teal">{selected?.protected?'PROTECTED':'STANDARD'}</span></div>
      {selected && <div className="detail-form">
        <label>Asset<input value={selected.identifier} disabled /></label>
        <label>Area<select value={selected.fire} disabled={!permission.sorties} onChange={e=>update('fire',e.target.value)}><option>Fire Alpha</option><option>Fire Bravo</option><option>Fire Charlie</option></select></label>
        <label>Requirement<input value={selected.requirement} disabled={!permission.requirements} onChange={e=>update('requirement',e.target.value)} /></label>
        <div className="two-field"><label>Start<select value={selected.start} disabled={!permission.sorties} onChange={e=>update('start',Number(e.target.value))}>{HOURS.map(h=><option key={h} value={h}>{String(h).padStart(2,'0')}00</option>)}</select></label><label>End<select value={selected.end} disabled={!permission.sorties} onChange={e=>update('end',Number(e.target.value))}>{HOURS.map(h=><option key={h} value={h}>{String(h).padStart(2,'0')}00</option>)}</select></label></div>
        <label>Collection Objective<input value={selected.objective} disabled={!permission.requirements} onChange={e=>update('objective',e.target.value)} /></label>
        <label>Assigned UPAD<select value={selected.upad} disabled={!permission.upad} onChange={e=>update('upad',e.target.value)}><option>UPAD-CA</option><option>UPAD-NW</option><option>UPAD-SW</option><option>Unassigned</option></select></label>
        <label>Product Status<select value={selected.productStatus} disabled={!permission.upad} onChange={e=>update('productStatus',e.target.value)}><option>NOT STARTED</option><option>QUEUED</option><option>IN PRODUCTION</option><option>AT RISK</option><option>DELIVERED</option></select></label>
        <label>Mission Status<select value={selected.missionStatus} disabled={!permission.sorties} onChange={e=>update('missionStatus',e.target.value)}><option>PLANNED</option><option>ACTIVE</option><option>DELAYED</option><option>AT RISK</option><option>COMPLETE</option><option>CANCELLED</option></select></label>
        <label className="check-row"><input type="checkbox" checked={selected.protected} disabled={!permission.sorties} onChange={e=>update('protected',e.target.checked)} /> Protected Mission</label>
      </div>}
    </aside>

    <section className="support full stateful-support">
      <article className="panel"><div className="panel-head"><h3>Unmet Needs</h3><span className="chip red">{matrix.unmetNeeds.filter(x=>x.status==='OPEN').length} OPEN</span></div>{matrix.unmetNeeds.map(item=><div className="support-record" key={item.id}><strong>{item.requirement} · {item.fire}</strong><p>{item.window} Local · {item.reason}</p><small>Decision deadline: {item.deadline}</small>{item.status==='OPEN'&&permission.gaps&&<button className="secondary-button" onClick={()=>onResolveNeed(item.id)}>Mark Coordinating</button>}</div>)}</article>
      <article className="panel"><div className="panel-head"><h3>Coverage Gaps</h3><span className="chip amber">{matrix.coverageGaps.filter(x=>x.status!=='RESOLVED').length} AT RISK</span></div>{matrix.coverageGaps.map(item=><div className="support-record" key={item.id}><strong>{item.fire} · {item.window} Local</strong><p>{item.consequence}</p><small>{item.requirement} · {item.status}</small>{item.status!=='RESOLVED'&&permission.gaps&&<button className="secondary-button" onClick={()=>onResolveGap(item.id)}>Resolve Gap</button>}</div>)}</article>
      <article className="panel"><div className="panel-head"><h3>Partner Assets</h3><span className="chip slate">CONTROLLED DATA</span></div>{matrix.partnerAssets.map(item=><div className="support-record" key={item.id}><strong>{item.agency}</strong><p>{item.asset} · {item.window}</p><small>{item.status}</small></div>)}</article>
      <article className="panel"><div className="panel-head"><h3>Airspace / TFR</h3><span className="chip amber">ACTION</span></div>{matrix.airspaceIssues.map(item=><div className="support-record" key={item.id}><strong>{item.fire}</strong><p>{item.issue}</p><small>Decision deadline: {item.deadline}</small></div>)}</article>
      <article className="panel full"><div className="panel-head"><h3>Leadership Notes</h3><span className="chip teal">VERSIONED</span></div><ul className="compact-list">{matrix.leadershipNotes.map(n=><li key={n}>{n}</li>)}</ul>{role==='remote_sensing_coordinator'&&<div className="inline-entry"><input value={note} onChange={e=>setNote(e.target.value)} placeholder="Add leadership note..."/><button className="secondary-button" onClick={()=>{if(note.trim()){onAddLeadershipNote(note.trim());setNote('')}}}>Add Note</button></div>}</article>
      <article className="panel full"><div className="panel-head"><h3>Matrix Version History</h3><span className="chip slate">AUTO-TRACKED</span></div><div className="history-list">{[...matrix.changeHistory].reverse().map(item=><div key={`${item.version}-${item.note}`}><strong>Version {item.version}</strong><span>{item.asOf} · {item.updatedBy}</span><p>{item.note}</p></div>)}</div>{permission.approval&&<button className="primary-button" disabled={matrix.coordinatorApprovalStatus==='approved'} onClick={onApprove}>{matrix.coordinatorApprovalStatus==='approved'?'Matrix Approved':'Approve Regional Matrix'}</button>}</article>
    </section>
  </div>
}
