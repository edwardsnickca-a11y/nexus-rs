import React, { useMemo, useState } from 'react'

const ROLE_LABELS={
 remote_sensing_coordinator:'Remote Sensing Coordinator',
 remote_sensing_manager:'Remote Sensing Manager',
 collection_manager:'Collection Manager',
 upad_lno:'UPAD LNO',
}

const normalizeTime=value=>{
 const match=String(value||'').match(/(\d{1,2})(?::?(\d{2}))?/)
 if(!match) return null
 const hour=Math.max(0,Math.min(23,Number(match[1])))
 const minute=Math.max(0,Math.min(59,Number(match[2]||0)))
 return hour*60+minute
}
const pct=value=>`${Math.max(0,Math.min(100,(value/1440)*100))}%`
const text=value=>value===undefined||value===null||value===''?'—':String(value)
const statusTone=value=>String(value||'planned').toLowerCase().replaceAll('_','-').replaceAll(' ','-')

function incidentNameFor(item,incidents){
 const direct=item.incident||item.fire||item.incidentName
 if(direct) return direct
 const id=item.incidentId||item.fireId
 return incidents.find(x=>x.id===id)?.name||'Regional / Unassigned'
}
function windowFor(item){
 const start=item.startTime||item.launchTime||item.onStation||item.windowStart
 const end=item.endTime||item.recoveryTime||item.offStation||item.windowEnd
 if(start||end) return {start:normalizeTime(start)||0,end:normalizeTime(end)||Math.min(1440,(normalizeTime(start)||0)+120),label:`${text(start)}–${text(end)}`}
 const parts=String(item.window||item.collectionWindow||'').match(/(\d{1,2}:?\d{0,2})\s*[–-]\s*(\d{1,2}:?\d{0,2})/)
 if(parts) return {start:normalizeTime(parts[1])||0,end:normalizeTime(parts[2])||0,label:item.window||item.collectionWindow}
 return {start:480,end:600,label:text(item.window||item.collectionWindow)}
}
function buildRows(matrix,missionState,incident,tomorrow=false){
 const source=tomorrow
  ? (matrix?.tomorrowSorties||matrix?.plannedSorties||missionState?.tomorrowPlan?.sorties||missionState?.tomorrowPlan?.missions||missionState?.tomorrowPlan?.requirements||[])
  : (matrix?.sorties||missionState?.currentOps?.missions||[])
 const incidents=missionState?.incidents||[]
 return source.filter(item=>incident==='__all__'||incidentNameFor(item,incidents)===incident).map((item,index)=>({
  ...item,
  id:item.id||`${tomorrow?'tomorrow':'today'}-${index+1}`,
  incident:incidentNameFor(item,incidents),
  platform:item.platform||item.asset||item.assetId||item.identifier||'Unassigned platform',
  callsign:item.callsign||item.tailNumber||item.identifier||'',
  agency:item.agency||item.owner||item.organization||item.sourceAgency||'—',
  requirement:item.requirement||item.requirementId||item.objective||item.title||'Unlinked requirement',
  upad:item.upad||item.upadId||item.assignedUpad||item.productionNode||'Unassigned',
  status:item.status||item.coordinationStatus||(tomorrow?'draft':'planned'),
  product:item.product||item.productStatus||item.expectedProduct||'—',
  note:item.note||item.constraint||item.risk||item.leadershipNote||'',
  lat:Number(item.lat||item.latitude||item.targetLat||item.target?.lat),
  lng:Number(item.lng||item.longitude||item.targetLng||item.target?.lng),
  windowInfo:windowFor(item),
 }))
}

function PermissionBanner({role}){
 const copy={
  remote_sensing_coordinator:'Can approve the regional matrix, resolve cross-incident conflicts, protect missions, and coordinate unmet needs.',
  remote_sensing_manager:'Can update today’s execution for assigned missions. Cannot approve tomorrow’s regional plan.',
  collection_manager:'Can refine requirement links, collection effects, and proposed tomorrow windows. Cannot retask aircraft.',
  upad_lno:'Can update UPAD assignment, production status, delivery risk, and handoff. Cannot change collection priority or aircraft tasking.',
 }[role]||'Read-only shared mission picture.'
 return <div className="sm-permission"><strong>{ROLE_LABELS[role]||'Observer'}</strong><span>{copy}</span></div>
}

function Timeline({title,rows,currentMinutes,tomorrow,role,readOnly,onUpdateSortie,onSelectRow,selectedRowId}){
 const canEditToday=role==='remote_sensing_manager'
 const canEditTomorrow=role==='collection_manager'||role==='remote_sensing_coordinator'
 const canEditUpad=role==='upad_lno'
 const editable=!readOnly&&(tomorrow?canEditTomorrow:(canEditToday||canEditUpad))
 return <section className="sm-section sm-timeline-section">
  <header><div><span>{tomorrow?'NEXT OPERATIONAL PERIOD':'CURRENT OPERATIONAL PERIOD'}</span><h2>{title}</h2></div><b>{rows.length} {rows.length===1?'SORTIE':'SORTIES'}</b></header>
  <div className="sm-grid-wrap">
   <div className="sm-grid sm-head"><div>PLATFORM / AGENCY</div><div>REQUIREMENT · UPAD · STATUS</div><div className="sm-hours">{Array.from({length:24},(_,h)=><span key={h}>{String(h).padStart(2,'0')}</span>)}</div></div>
   <div className="sm-body">
    {!tomorrow&&currentMinutes!==null&&<div className="sm-now" style={{left:`calc(420px + (100% - 420px) * ${currentMinutes/1440})`}}><i/><span>NOW</span></div>}
    {rows.length===0&&<div className="sm-empty">No sorties are currently assigned to this incident.</div>}
    {rows.map(row=>{
     const width=Math.max(2,row.windowInfo.end-row.windowInfo.start)
     return <div className={`sm-grid sm-row ${selectedRowId===row.id?'selected':''}`} key={row.id} onClick={()=>onSelectRow?.(row.id)}>
      <div className="sm-platform"><strong>{row.platform}{row.callsign?` · ${row.callsign}`:''}</strong><span>{row.agency}</span></div>
      <div className="sm-details"><strong>{row.requirement}</strong><span>UPAD: {row.upad} · {String(row.status).replaceAll('_',' ')}</span>{row.note&&<em>{row.note}</em>}</div>
      <div className="sm-track">
       <div className={`sm-block ${statusTone(row.status)} ${tomorrow?'draft':''}`} style={{left:pct(row.windowInfo.start),width:pct(width)}} title={`${row.platform} · ${row.windowInfo.label}`}>
        <strong>{row.windowInfo.label}</strong><span>{row.product}</span>
       </div>
      </div>
      {editable&&<div className="sm-edit" onClick={e=>e.stopPropagation()}>
       {canEditToday&&!tomorrow&&<select value={row.status} onChange={e=>onUpdateSortie?.(row.id,{status:e.target.value})}><option value="planned">Planned</option><option value="launched">Launched</option><option value="on_station">On station</option><option value="collecting">Collecting</option><option value="delayed">Delayed</option><option value="returning">Returning</option><option value="landed">Landed</option><option value="unable">Unable</option></select>}
       {canEditTomorrow&&tomorrow&&<select value={row.status} onChange={e=>onUpdateSortie?.(row.id,{status:e.target.value})}><option value="draft">Draft</option><option value="coordinating">Coordinating</option><option value="confirmed">Confirmed</option><option value="at_risk">At risk</option></select>}
       {canEditUpad&&!tomorrow&&<input value={row.upad==='Unassigned'?'':row.upad} placeholder="UPAD" onChange={e=>onUpdateSortie?.(row.id,{upad:e.target.value})}/>} 
      </div>}
     </div>
    })}
   </div>
  </div>
 </section>
}

function SyncMap({incident,rows,missionState,selectedRowId,onSelectRow}){
 const incidentRecord=(missionState.incidents||[]).find(x=>x.name===incident)
 const points=rows.map(r=>({id:r.id,label:r.platform,requirement:r.requirement,lat:r.lat,lng:r.lng})).filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lng))
 if(incidentRecord&&Number.isFinite(Number(incidentRecord.lat))&&Number.isFinite(Number(incidentRecord.lng))){
  points.unshift({id:'incident-center',label:incidentRecord.name,requirement:'Incident area',lat:Number(incidentRecord.lat),lng:Number(incidentRecord.lng)})
 }
 if(!points.length) return <section className="sm-map-card"><header><span>INCIDENT DISPLAY</span><h2>MAP</h2></header><div className="sm-map-empty">No mapped collection coordinates are available for this sync.</div></section>
 const minLat=Math.min(...points.map(p=>p.lat)),maxLat=Math.max(...points.map(p=>p.lat))
 const minLng=Math.min(...points.map(p=>p.lng)),maxLng=Math.max(...points.map(p=>p.lng))
 const latSpan=Math.max(.08,maxLat-minLat),lngSpan=Math.max(.08,maxLng-minLng)
 const project=p=>({x:8+((p.lng-minLng)/lngSpan)*84,y:92-((p.lat-minLat)/latSpan)*84})
 return <section className="sm-map-card"><header><span>INCIDENT DISPLAY</span><h2>MAP</h2></header><div className="sm-map">
  <svg viewBox="0 0 100 100" role="img" aria-label={`${incident} sync map`}>
   <defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="#173a4a" strokeWidth=".5"/></pattern></defs>
   <rect width="100" height="100" fill="#0a1b27"/><rect width="100" height="100" fill="url(#grid)"/>
   {points.map(p=>{const q=project(p);const selected=selectedRowId===p.id;return <g key={p.id} className="sm-map-point" onClick={()=>p.id!=='incident-center'&&onSelectRow?.(p.id)}>
    <circle cx={q.x} cy={q.y} r={p.id==='incident-center'?4:selected?3.8:3} fill={p.id==='incident-center'?'#ff8a35':selected?'#ffe082':'#58d7e4'} stroke="#071827" strokeWidth="1.2"/>
    <text x={q.x+4} y={q.y-2} fontSize="3.4" fill="#dce9ee">{p.label}</text>
   </g>})}
  </svg>
 </div><div className="sm-map-legend"><span><i className="incident"/> Incident</span><span><i/> Collection / sortie</span></div></section>
}

function printableHtml({incident,view,rows,missionState,matrix,currentMinutes}){
 const title=view==='today'?"TODAY’S SYNC":"TOMORROW’S SYNC"
 const rowsHtml=rows.map(r=>`<tr><td><b>${text(r.platform)}</b><br><span>${text(r.agency)}</span></td><td><b>${text(r.requirement)}</b><br><span>UPAD: ${text(r.upad)} · ${text(r.status)}</span></td><td>${text(r.windowInfo.label)}</td><td>${text(r.product)}</td></tr>`).join('')
 return `<!doctype html><html><head><meta charset="utf-8"><title>${incident} - ${title}</title><style>body{font-family:Arial,sans-serif;margin:24px;color:#10212b}header{display:flex;justify-content:space-between;border-bottom:3px solid #0d6b78;padding-bottom:12px;margin-bottom:18px}h1{margin:0;font-size:28px}h2{margin:4px 0 0;color:#0d6b78;font-size:16px}.meta{text-align:right;font-size:12px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #9fb2ba;padding:8px;vertical-align:top}th{background:#dceff3;text-align:left}td span{color:#536b75}.note{margin-top:16px;font-size:11px;color:#536b75}@media print{button{display:none}body{margin:.35in}}</style></head><body><header><div><h1>${incident}</h1><h2>${title}</h2></div><div class="meta">Local time only<br>Version ${text(matrix?.version||1)}<br>Status ${text(matrix?.status||matrix?.coordinatorApprovalStatus||'DRAFT')}</div></header><table><thead><tr><th>Platform / Agency</th><th>Requirement / UPAD / Status</th><th>Collection Window</th><th>Product</th></tr></thead><tbody>${rowsHtml||'<tr><td colspan="4">No sorties assigned.</td></tr>'}</tbody></table><div class="note">Generated from the NEXUS RS Sync Matrix. Use the browser Print command and select “Save as PDF.”</div><script>window.addEventListener('load',()=>setTimeout(()=>window.print(),250))</script></body></html>`
}

export default function SyncMatrix({role,matrix,missionState={},readOnly=false,onUpdateSortie,onResolveNeed,onResolveGap,onApprove,onAddLeadershipNote}){
 const incidents=missionState.incidents||[]
 const incidentTabs=useMemo(()=>{
  const names=incidents.map(x=>x.name).filter(Boolean)
  const inferred=[...(matrix?.sorties||[]),...(matrix?.tomorrowSorties||matrix?.plannedSorties||[])].map(x=>incidentNameFor(x,incidents)).filter(Boolean)
  return [...new Set([...names,...inferred])]
 },[incidents,matrix])
 const [activeIncident,setActiveIncident]=useState(incidentTabs[0]||'__all__')
 const [activeView,setActiveView]=useState('today')
 const [selectedRowId,setSelectedRowId]=useState(null)
 const [note,setNote]=useState('')
 const todayRows=buildRows(matrix,missionState,activeIncident,false)
 const tomorrowRows=buildRows(matrix,missionState,activeIncident,true)
 const activeRows=activeView==='today'?todayRows:tomorrowRows
 const currentMinutes=normalizeTime(missionState.exercise?.localIncidentTime||missionState.asOf)
 const canApprove=!readOnly&&role==='remote_sensing_coordinator'
 const canCoordinate=!readOnly&&role==='remote_sensing_coordinator'
 const needs=(matrix?.unmetNeeds||[]).filter(x=>activeIncident==='__all__'||incidentNameFor(x,incidents)===activeIncident)
 const gaps=(matrix?.coverageGaps||[]).filter(x=>activeIncident==='__all__'||incidentNameFor(x,incidents)===activeIncident)
 const openSync=()=>{
  const popup=window.open('','_blank','noopener,noreferrer,width=1400,height=900')
  if(!popup) return
  popup.document.open();popup.document.write(printableHtml({incident:activeIncident,view:activeView,rows:activeRows,missionState,matrix,currentMinutes}));popup.document.close()
 }
 return <div className="sm-page">
  <style>{`
   .sm-page{padding:14px 16px 28px;color:#dce9ee;background:#071827;min-height:100%;font-size:12px}.sm-titlebar{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:10px}.sm-titlebar h1{margin:2px 0 4px;font-size:24px}.sm-titlebar p{margin:0;color:#8fa7b3}.sm-meta{display:flex;gap:8px;align-items:center}.sm-chip{border:1px solid #2e6074;background:#0c2938;padding:7px 10px}.sm-chip b{color:#78e4ef}.sm-permission{display:flex;gap:10px;align-items:center;border:1px solid #275268;background:#0b2433;padding:9px 12px;margin-bottom:10px}.sm-permission strong{color:#72e3ee}.sm-permission span{color:#a8bbc4}.sm-tabs{display:flex;gap:4px;overflow-x:auto;position:sticky;top:0;z-index:8;background:#071827;padding:4px 0 8px}.sm-tabs button,.sm-view-tabs button{white-space:nowrap;border:1px solid #275268;background:#0b2230;color:#a9c0ca;padding:9px 14px;cursor:pointer}.sm-tabs button.active,.sm-view-tabs button.active{background:#123b50;color:#86edf4;border-color:#48cddd}.sm-viewbar{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:0 0 10px}.sm-view-tabs{display:flex;gap:4px}.sm-view-actions{display:flex;gap:6px}.sm-view-actions button{border:1px solid #3bbccc;background:#0d3342;color:#86e8ef;padding:8px 10px;cursor:pointer}.sm-content{display:grid;grid-template-columns:minmax(0,2.3fr) minmax(300px,.8fr);gap:10px;align-items:start}.sm-section,.sm-map-card{border:1px solid #234b5e;background:#0a1e2c}.sm-section>header,.sm-map-card>header{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-bottom:1px solid #234b5e;background:#0e2a3a}.sm-section h2,.sm-map-card h2{font-size:16px;margin:2px 0}.sm-section header span,.sm-map-card header span{color:#69dce7;font-size:9px}.sm-section header>b{color:#ffbd54}.sm-grid-wrap{overflow:auto;max-height:58vh}.sm-grid{display:grid;grid-template-columns:190px 230px minmax(820px,1fr);min-width:1240px}.sm-head{position:sticky;top:0;z-index:4;background:#102f40;color:#73e2ec;font-size:9px}.sm-head>div{padding:8px;border-right:1px solid #254c5e}.sm-hours{display:grid;grid-template-columns:repeat(24,1fr);padding:0!important}.sm-hours span{padding:8px 0;text-align:center;border-left:1px solid #24495a}.sm-body{position:relative}.sm-row{position:relative;min-height:66px;border-top:1px solid #1d3d4d;cursor:pointer}.sm-row.selected{outline:2px solid #ffe082;outline-offset:-2px}.sm-row>div{border-right:1px solid #24495a}.sm-platform,.sm-details{padding:10px}.sm-platform strong,.sm-details strong{display:block}.sm-platform span,.sm-details span,.sm-details em{display:block;color:#8fa7b3;margin-top:4px;font-style:normal}.sm-details em{color:#ffbd54}.sm-track{position:relative;background:repeating-linear-gradient(to right,transparent,transparent calc(4.166% - 1px),#1e3d4c calc(4.166% - 1px),#1e3d4c 4.166%)}.sm-block{position:absolute;top:10px;height:46px;min-width:34px;padding:7px 8px;border:1px solid #46d1df;background:#13536a;overflow:hidden;box-sizing:border-box}.sm-block.draft{border-style:dashed}.sm-block.delayed,.sm-block.at-risk{background:#6f4a16;border-color:#ffbd54}.sm-block.unable{background:#5c2830;border-color:#ff6f7d}.sm-block.collecting,.sm-block.on-station{background:#155c4d;border-color:#61d8a3}.sm-block strong,.sm-block span{display:block;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.sm-block span{font-size:9px;color:#b9d1d8;margin-top:3px}.sm-now{position:absolute;top:0;bottom:0;z-index:5;pointer-events:none}.sm-now i{position:absolute;top:0;bottom:0;border-left:2px dashed #ff8a35}.sm-now span{position:sticky;top:3px;margin-left:5px;background:#ff8a35;color:#071827;font-weight:800;font-size:8px;padding:2px 4px}.sm-empty,.sm-map-empty{padding:26px;color:#8fa7b3}.sm-edit{grid-column:1/-1!important;display:flex;gap:6px;padding:5px 10px;background:#091a26}.sm-edit select,.sm-edit input{background:#071827;border:1px solid #346177;color:#dce9ee;padding:5px}.sm-map{height:58vh;min-height:360px}.sm-map svg{width:100%;height:100%;display:block}.sm-map-point{cursor:pointer}.sm-map-legend{display:flex;gap:12px;padding:8px 10px;border-top:1px solid #234b5e;color:#8fa7b3}.sm-map-legend i{display:inline-block;width:9px;height:9px;border-radius:50%;background:#58d7e4;margin-right:4px}.sm-map-legend i.incident{background:#ff8a35}.sm-bottom{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}.sm-card{border:1px solid #244b5d;background:#0a1f2d;padding:10px}.sm-card h3{margin:0 0 8px;font-size:12px;color:#72e3ee}.sm-item{display:grid;grid-template-columns:1fr auto;gap:8px;border-top:1px solid #213f4f;padding:8px 0}.sm-item small{display:block;color:#8fa7b3;margin-top:3px}.sm-item button,.sm-actions button{border:1px solid #3bbccc;background:#0d3342;color:#86e8ef;padding:6px 9px;cursor:pointer}.sm-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:10px}.sm-note{display:flex;gap:6px}.sm-note input{flex:1;background:#071827;border:1px solid #315b6e;color:#dce9ee;padding:8px}.sm-approved{color:#67d9a2}.sm-pending{color:#ffbd54}@media(max-width:1100px){.sm-content{grid-template-columns:1fr}.sm-map{height:360px}.sm-bottom{grid-template-columns:1fr}.sm-titlebar{flex-direction:column}}
  `}</style>
  <div className="sm-titlebar"><div><span style={{color:'#70e0eb',fontSize:9}}>SHARED REGIONAL MISSION PICTURE</span><h1>SYNC MATRIX</h1><p>Incident-specific execution and next-period coordination. Local incident time only.</p></div><div className="sm-meta"><div className="sm-chip">VERSION <b>{matrix?.version||1}</b></div><div className="sm-chip">STATUS <b className={matrix?.coordinatorApprovalStatus==='approved'?'sm-approved':'sm-pending'}>{matrix?.status||matrix?.coordinatorApprovalStatus||'DRAFT'}</b></div></div></div>
  <PermissionBanner role={role}/>
  <div className="sm-tabs">{incidentTabs.length?incidentTabs.map(name=><button key={name} className={activeIncident===name?'active':''} onClick={()=>{setActiveIncident(name);setSelectedRowId(null)}}>{name}</button>):<button className="active">REGIONAL / UNASSIGNED</button>}</div>
  <div className="sm-viewbar"><div className="sm-view-tabs"><button className={activeView==='today'?'active':''} onClick={()=>{setActiveView('today');setSelectedRowId(null)}}>TODAY’S SYNC</button><button className={activeView==='tomorrow'?'active':''} onClick={()=>{setActiveView('tomorrow');setSelectedRowId(null)}}>TOMORROW’S SYNC</button></div><div className="sm-view-actions"><button onClick={openSync}>OPEN SYNC / SAVE PDF</button></div></div>
  <div className="sm-content">
   <Timeline title={activeView==='today'?"TODAY’S SYNC":"TOMORROW’S SYNC"} rows={activeRows} currentMinutes={activeView==='today'?currentMinutes:null} tomorrow={activeView==='tomorrow'} role={role} readOnly={readOnly} onUpdateSortie={onUpdateSortie} onSelectRow={setSelectedRowId} selectedRowId={selectedRowId}/>
   <SyncMap incident={activeIncident} rows={activeRows} missionState={missionState} selectedRowId={selectedRowId} onSelectRow={setSelectedRowId}/>
  </div>
  <div className="sm-bottom">
   <div className="sm-card"><h3>UNMET COLLECTION NEEDS</h3>{needs.length?needs.map(x=><div className="sm-item" key={x.id}><div><strong>{text(x.title||x.requirement||x.id)}</strong><small>{text(x.detail||x.reason||x.status)}</small></div>{canCoordinate&&x.status!=='COORDINATING'&&<button onClick={()=>onResolveNeed?.(x.id)}>COORDINATE</button>}</div>):<div className="sm-empty">No unmet needs recorded for this incident.</div>}</div>
   <div className="sm-card"><h3>COVERAGE GAPS / LEADERSHIP NOTES</h3>{gaps.map(x=><div className="sm-item" key={x.id}><div><strong>{text(x.title||x.gap||x.id)}</strong><small>{text(x.detail||x.status)}</small></div>{canCoordinate&&x.status!=='RESOLVED'&&<button onClick={()=>onResolveGap?.(x.id)}>RESOLVE</button>}</div>)}{canApprove&&<div className="sm-note"><input value={note} onChange={e=>setNote(e.target.value)} placeholder="Add leadership brief note"/><button onClick={()=>{if(note.trim()){onAddLeadershipNote?.(note.trim());setNote('')}}}>ADD</button></div>}</div>
  </div>
  {canApprove&&<div className="sm-actions"><button onClick={onApprove}>APPROVE MATRIX FOR LEADERSHIP BRIEF</button></div>}
 </div>
}
