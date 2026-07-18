import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AIRSPACE_STATUS_OPTIONS, FTA_REFERENCE_TABLE } from '../data/airspaceReference.js'

const clamp=(value,min,max)=>Math.max(min,Math.min(max,value))
const tone=value=>String(value||'').toLowerCase().replaceAll('_','-').replaceAll(' ','-')
const text=(value,fallback='Not provided')=>value===undefined||value===null||value===''?fallback:String(value)
const statusLabel=value=>String(value||'UNKNOWN').replaceAll('_',' ')
const unresolved=new Set(['NOT_STARTED','IN_PROGRESS','UNCOORDINATED','PENDING','COORDINATION_REQUIRED','ESCALATED','UNRESOLVED'])

function projectLatLng(lat,lng,zoom){
 const scale=256*(2**zoom)
 const x=(lng+180)/360*scale
 const sin=Math.sin(lat*Math.PI/180)
 const y=(.5-Math.log((1+sin)/(1-sin))/(4*Math.PI))*scale
 return{x,y}
}
function unprojectPoint(x,y,zoom){
 const scale=256*(2**zoom)
 const lng=x/scale*360-180
 const n=Math.PI-2*Math.PI*y/scale
 const lat=180/Math.PI*Math.atan(.5*(Math.exp(n)-Math.exp(-n)))
 return{lat,lng}
}
function minutesFrom(value){
 if(!value)return null
 const iso=Date.parse(value)
 if(Number.isFinite(iso))return iso
 const match=String(value).match(/(\d{1,2}):?(\d{2})?/) 
 if(!match)return null
 const d=new Date();d.setHours(Number(match[1]),Number(match[2]||0),0,0);return d.getTime()
}
function formatWindow(record){
 const start=record.effectiveWindow?.start||record.effectiveStartLocal||record.start||record.windowStart
 const end=record.effectiveWindow?.end||record.effectiveEndLocal||record.end||record.windowEnd
 if(!start&&!end)return 'Not provided'
 return `${text(start,'TBD')} – ${text(end,'TBD')}`
}
function formatAltitude(record){
 if(record.altitude)return record.altitude
 const floor=record.altitudeFloor||record.floor
 const ceiling=record.altitudeCeiling||record.ceiling
 return floor||ceiling?`${text(floor,'Surface')}–${text(ceiling,'Unlimited')}`:'Not provided'
}
function incidentFor(record,incidents){
 const direct=record.incident||record.incidentName||record.area
 if(direct)return direct
 const id=record.incidentId
 return incidents.find(item=>item.id===id)?.name||'Regional / Unassigned'
}
function missionLabel(mission){return mission.callsign||mission.identifier||mission.platform||mission.name||mission.id||'Mission'}
function normalizeAirspace(missionState){
 const incidents=missionState.incidents||[]
 const missions=missionState.currentOps?.missions||missionState.sorties||[]
 const raw=missionState.airspace
 const rawRestrictions=Array.isArray(raw)?raw:(raw?.restrictions||raw?.records||[])
 const restrictions=rawRestrictions.map((item,index)=>{
  const incidentName=incidentFor(item,incidents)
  const incident=incidents.find(x=>x.name===incidentName||x.id===item.incidentId)
  const affected=item.affectedMissions||item.affectedMissionIds||[]
  const affectedLabels=affected.map(id=>missionLabel(missions.find(m=>m.id===id||missionLabel(m)===id)||{callsign:id}))
  return{
   ...item,
   id:item.id||`airspace-${index+1}`,
   operationalLabel:item.operationalLabel||item.name||item.label||item.text||`${item.type||'Airspace'} — ${incidentName}`,
   type:item.type||'Airspace restriction',
   status:String(item.status||'PENDING').toUpperCase(),
   incident:incidentName,
   managingAgency:item.managingAgency||item.owningAgency||item.agency||'Not provided',
   centerLat:Number(item.centerLat??item.lat??incident?.lat),
   centerLng:Number(item.centerLng??item.lng??incident?.lng),
   affectedMissions:affectedLabels,
   coordinationStatus:String(item.coordinationStatus||item.status||'UNCOORDINATED').toUpperCase(),
   altitudeOccupancy:Array.isArray(item.altitudeOccupancy)&&item.altitudeOccupancy.length?item.altitudeOccupancy:FTA_REFERENCE_TABLE,
  }
 })
 const conflictsRaw=Array.isArray(raw?.conflicts)?raw.conflicts:[]
 const conflicts=conflictsRaw.map((item,index)=>{
  const mission=missions.find(m=>m.id===item.missionId||missionLabel(m)===item.missionId)
  const restriction=restrictions.find(r=>r.id===item.restrictionId)
  return{
   ...item,
   id:item.id||`airspace-conflict-${index+1}`,
   missionLabel:item.mission||missionLabel(mission||{callsign:item.missionId}),
   restrictionLabel:item.restriction||restriction?.operationalLabel||item.restrictionId||'Airspace record',
   status:String(item.status||'NOT_STARTED').toUpperCase(),
   conflictType:item.conflictType||item.type||'COORDINATION_REQUIRED',
   impact:item.impact||item.description||'Mission access coordination is required.',
   requiredCoordination:item.requiredCoordination||item.action||'Confirm the appropriate coordination path.',
  }
 })
 return{incidents,missions,restrictions,conflicts}
}

function SummaryCard({label,value,detail,active,onClick,toneName}){
 return <button type="button" className={`airspace-summary-card ${toneName} ${active?'active':''}`} onClick={onClick}>
  <span>{label}</span><strong>{value}</strong><small>{detail}</small>
 </button>
}

function AirspaceMap({incidents,missions,restrictions,conflicts,selection,onSelect}){
 const hostRef=useRef(null),dragRef=useRef(null)
 const valid=[...incidents.map(x=>({lat:Number(x.lat),lng:Number(x.lng)})),...restrictions.map(x=>({lat:x.centerLat,lng:x.centerLng}))].filter(x=>Number.isFinite(x.lat)&&Number.isFinite(x.lng))
 const initial=valid.length?{lat:valid.reduce((s,x)=>s+x.lat,0)/valid.length,lng:valid.reduce((s,x)=>s+x.lng,0)/valid.length}:{lat:39.5,lng:-121.5}
 const [view,setView]=useState({...initial,zoom:7}),[size,setSize]=useState({width:800,height:520})
 useEffect(()=>{const node=hostRef.current;if(!node)return;const update=()=>setSize({width:node.clientWidth,height:node.clientHeight});const wheel=e=>{e.preventDefault();setView(v=>({...v,zoom:clamp(v.zoom+(e.deltaY<0?1:-1),5,13)}))};update();const obs=new ResizeObserver(update);obs.observe(node);node.addEventListener('wheel',wheel,{passive:false});return()=>{obs.disconnect();node.removeEventListener('wheel',wheel)}},[])
 const center=projectLatLng(view.lat,view.lng,view.zoom),topLeft={x:center.x-size.width/2,y:center.y-size.height/2},tileSize=256,tileCount=2**view.zoom,tiles=[]
 for(let x=Math.floor(topLeft.x/tileSize);x<=Math.floor((topLeft.x+size.width)/tileSize);x++)for(let y=Math.floor(topLeft.y/tileSize);y<=Math.floor((topLeft.y+size.height)/tileSize);y++){if(y<0||y>=tileCount)continue;tiles.push({key:`${x}-${y}`,x:x*tileSize-topLeft.x,y:y*tileSize-topLeft.y,url:`https://tile.openstreetmap.org/${view.zoom}/${((x%tileCount)+tileCount)%tileCount}/${y}.png`})}
 const pos=(lat,lng)=>{const p=projectLatLng(lat,lng,view.zoom);return{left:p.x-topLeft.x,top:p.y-topLeft.y}}
 const down=e=>{e.currentTarget.setPointerCapture(e.pointerId);dragRef.current={x:e.clientX,y:e.clientY,center:projectLatLng(view.lat,view.lng,view.zoom)}}
 const move=e=>{if(!dragRef.current)return;const next=unprojectPoint(dragRef.current.center.x-(e.clientX-dragRef.current.x),dragRef.current.center.y-(e.clientY-dragRef.current.y),view.zoom);setView(v=>({...v,lat:clamp(next.lat,-80,80),lng:next.lng}))}
 const up=e=>{dragRef.current=null;try{e.currentTarget.releasePointerCapture(e.pointerId)}catch{}}
 const metersPerPixel=156543.03392*Math.cos(view.lat*Math.PI/180)/(2**view.zoom),targetNm=metersPerPixel*120/1852,mag=10**Math.floor(Math.log10(Math.max(targetNm,.01))),norm=targetNm/mag,niceNm=(norm>=5?5:norm>=2?2:1)*mag,scaleWidth=Math.max(42,Math.min(140,niceNm*1852/metersPerPixel))
 return <div ref={hostRef} className="airspace-map" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
  <div className="airspace-map-tiles">{tiles.map(t=><img key={t.key} src={t.url} alt="" draggable="false" style={{left:t.x,top:t.y}}/>)}</div>
  <svg className="airspace-map-overlays" width={size.width} height={size.height} aria-hidden="true">
   {restrictions.filter(r=>Number.isFinite(r.centerLat)&&Number.isFinite(r.centerLng)).map(r=>{const p=pos(r.centerLat,r.centerLng),selected=selection?.type==='airspace'&&selection.id===r.id;return <circle key={r.id} cx={p.left} cy={p.top} r={selected?66:54} className={`airspace-restriction-ring ${tone(r.status)} ${selected?'selected':''}`} onClick={()=>onSelect({type:'airspace',id:r.id})}/>})}
  </svg>
  <div className="airspace-map-legend"><strong>LEGEND</strong><span><i className="active"/> Active restriction</span><span><i className="upcoming"/> Upcoming restriction</span><span>🔥 Incident</span><span>✈ Mission</span><span>◆ Conflict</span></div>
  {incidents.filter(x=>Number.isFinite(Number(x.lat))&&Number.isFinite(Number(x.lng))).map(x=>{const p=pos(Number(x.lat),Number(x.lng));return <button key={x.id||x.name} type="button" className="airspace-incident-marker" style={p} title={x.name}>🔥<b>{x.name}</b></button>})}
  {missions.slice(0,8).map((m,index)=>{const incident=incidents.find(x=>x.name===(m.fire||m.incident));if(!incident)return null;const lat=Number(m.lat??incident.lat)-.035-(index%3)*.015,lng=Number(m.lng??incident.lng)+.035+(index%2)*.02;if(!Number.isFinite(lat)||!Number.isFinite(lng))return null;const p=pos(lat,lng),id=m.id||missionLabel(m);return <button key={id} type="button" className={`airspace-mission-marker ${selection?.type==='mission'&&selection.id===id?'selected':''}`} style={p} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();onSelect({type:'mission',id})}}>✈<b>{missionLabel(m)}</b></button>})}
  {conflicts.map((c,index)=>{const restriction=restrictions.find(r=>r.id===c.restrictionId);if(!restriction||!Number.isFinite(restriction.centerLat))return null;const p=pos(restriction.centerLat+.025+(index*.008),restriction.centerLng+.025);return <button key={c.id} type="button" className={`airspace-conflict-marker ${selection?.type==='conflict'&&selection.id===c.id?'selected':''}`} style={p} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();onSelect({type:'conflict',id:c.id})}}>◆</button>})}
  <div className="airspace-map-controls" onPointerDown={e=>e.stopPropagation()}><button type="button" aria-label="Zoom in" onClick={()=>setView(v=>({...v,zoom:clamp(v.zoom+1,5,13)}))}>+</button><button type="button" aria-label="Zoom out" onClick={()=>setView(v=>({...v,zoom:clamp(v.zoom-1,5,13)}))}>−</button><button type="button" aria-label="Reset map" onClick={()=>setView({...initial,zoom:7})}>⌂</button></div>
  <div className="airspace-map-scale" style={{width:scaleWidth}}><span>0</span><span>{Number((niceNm/2).toFixed(1))}</span><span>{Number(niceNm.toFixed(1))} NM</span><i/></div>
  <div className="airspace-map-attribution">© OpenStreetMap contributors</div>
 </div>
}

function DetailRows({rows}){return <dl className="airspace-detail-list">{rows.map(([k,v])=><div key={k}><dt>{k}</dt><dd>{text(v)}</dd></div>)}</dl>}
function StatusPanel({selection,data}){
 if(!selection)return <section className="panel airspace-status"><h3>Airspace Status</h3><div className="airspace-empty">Select an airspace record, mission, or conflict to view operational details.</div></section>
 if(selection.type==='airspace'){
  const r=data.restrictions.find(x=>x.id===selection.id);if(!r)return null
  const related=data.conflicts.filter(c=>c.restrictionId===r.id)
  return <section className="panel airspace-status"><div className="panel-heading"><div><span className="eyebrow">Selected Airspace Record</span><h3>{r.operationalLabel}</h3></div><span className={`chip ${r.status==='ACTIVE'?'red':r.status==='UPCOMING'?'amber':'slate'}`}>{r.status}</span></div><DetailRows rows={[["Type",r.type],["Incident / Area",r.incident],["Managing Agency",r.managingAgency],["Effective Window",formatWindow(r)],["Altitude",formatAltitude(r)],["Coordination Channel",r.channel||r.coordinationChannel],["Contact",r.contact?.value||r.contact],["Affected Missions",r.affectedMissions?.join(', ')],["Coordination Status",statusLabel(r.coordinationStatus)],["Known Conflicts",related.length],["Owner",r.coordinationOwner],["Last Updated",r.lastUpdated]]}/><div className="airspace-occupancy"><h4>FTA / Altitude Occupancy</h4>{(r.altitudeOccupancy||[]).map((x,i)=><div key={`${x.band}-${i}`}><strong>{x.band}</strong><span>{x.occupant||'Open / unassigned'}</span><em>{x.status}</em></div>)}</div></section>
 }
 if(selection.type==='mission'){
  const m=data.missions.find(x=>(x.id||missionLabel(x))===selection.id);if(!m)return null
  const related=data.conflicts.filter(c=>c.missionId===m.id||c.missionLabel===missionLabel(m))
  return <section className="panel airspace-status"><span className="eyebrow">Selected Mission</span><h3>{missionLabel(m)}</h3><DetailRows rows={[["Platform",m.platform],["Incident",m.fire||m.incident],["Collection Area",m.collectionArea||m.target||m.requirement],["Operating Window",m.window||`${m.startTime||'TBD'}–${m.endTime||'TBD'}`],["Planned Altitude",m.altitude||m.plannedAltitude],["Airspace Conflicts",related.length],["Mission Status",statusLabel(m.status)],["Risk",m.risk]]}/></section>
 }
 const c=data.conflicts.find(x=>x.id===selection.id);if(!c)return null
 return <section className="panel airspace-status"><div className="panel-heading"><div><span className="eyebrow">Selected Conflict</span><h3>{c.missionLabel}</h3></div><span className={`chip ${unresolved.has(c.status)?'amber':'teal'}`}>{statusLabel(c.status)}</span></div><DetailRows rows={[["Restriction",c.restrictionLabel],["Tier",statusLabel(c.tier)],["Conflict Type",statusLabel(c.conflictType)],["Operational Impact",c.impact],["Required Coordination",c.requiredCoordination],["Owner",c.owner],["Deadline",c.deadline],["Resolution Notes",c.resolutionNotes]]}/></section>
}

function RecordsTable({records,selectedId,onSelect}){
 return <section className="panel airspace-table-panel"><div className="panel-heading"><h3>Airspace Records</h3><span className="chip slate">{records.length} RECORDS</span></div>{records.length===0?<div className="airspace-empty">No active or upcoming airspace restrictions are currently available for this exercise.</div>:<div className="airspace-table-wrap"><table className="airspace-table"><thead><tr><th>Restriction</th><th>Incident / Area</th><th>Effective Period</th><th>Altitude</th><th>Managing Agency</th><th>Affected Missions</th><th>Status</th></tr></thead><tbody>{records.map(r=><tr key={r.id} tabIndex="0" className={selectedId===r.id?'selected':''} onClick={()=>onSelect({type:'airspace',id:r.id})} onKeyDown={e=>{if(e.key==='Enter'||e.key===' ')onSelect({type:'airspace',id:r.id})}}><td><strong>{r.operationalLabel}</strong></td><td>{r.incident}</td><td>{formatWindow(r)}</td><td>{formatAltitude(r)}</td><td>{r.managingAgency}</td><td>{r.affectedMissions?.join(', ')||'None'}</td><td><span className={`airspace-status-badge ${tone(r.status)}`}>{r.status}</span></td></tr>)}</tbody></table></div>}</section>
}
function ConflictsTable({conflicts,selectedId,onSelect,role,readOnly,onUpdate}){
 const canCoordinate=role==='remote_sensing_coordinator'
 const canReplan=role==='remote_sensing_manager'
 return <section className="panel airspace-table-panel"><div className="panel-heading"><h3>Conflicts / Required Actions</h3><span className="chip slate">{conflicts.length} ACTIONS</span></div>{conflicts.length===0?<div className="airspace-empty">No unresolved airspace conflicts are currently affecting planned missions.</div>:<div className="airspace-table-wrap"><table className="airspace-table"><thead><tr><th>Mission</th><th>Conflict</th><th>Required Coordination</th><th>Owner</th><th>Deadline</th><th>Status</th></tr></thead><tbody>{conflicts.map(c=><tr key={c.id} className={selectedId===c.id?'selected':''} onClick={()=>onSelect({type:'conflict',id:c.id})}><td><strong>{c.missionLabel}</strong></td><td>{c.impact}</td><td>{c.requiredCoordination}</td><td>{text(c.owner,'Unassigned')}</td><td>{text(c.deadline,'TBD')}</td><td>{!readOnly&&(canCoordinate||canReplan)?<select aria-label={`Status for ${c.missionLabel}`} value={c.status} onClick={e=>e.stopPropagation()} onChange={e=>onUpdate?.(c.id,{status:e.target.value,updatedAt:new Date().toISOString()})}>{AIRSPACE_STATUS_OPTIONS.map(x=><option key={x} value={x}>{statusLabel(x)}</option>)}</select>:<span className={`airspace-status-badge ${tone(c.status)}`}>{statusLabel(c.status)}</span>}</td></tr>)}</tbody></table></div>}</section>
}

export default function AirspaceWorkspace({role,missionState={},readOnly=false,onUpdateAirspaceAction}){
 const data=useMemo(()=>normalizeAirspace(missionState),[missionState])
 const [selection,setSelection]=useState(null),[filter,setFilter]=useState(null)
 const now=minutesFrom(missionState.exercise?.localIncidentTime)||Date.now(),twelveHours=12*60*60*1000
 const active=data.restrictions.filter(r=>r.status==='ACTIVE')
 const upcoming=data.restrictions.filter(r=>{const start=minutesFrom(r.effectiveWindow?.start||r.effectiveStartLocal);return r.status==='UPCOMING'||(start&&start>=now&&start<=now+twelveHours)})
 const openConflicts=data.conflicts.filter(c=>unresolved.has(c.status))
 const missionsAtRisk=new Set(openConflicts.map(c=>c.missionId||c.missionLabel)).size
 const filteredRecords=filter==='active'?active:filter==='upcoming'?upcoming:data.restrictions
 const filteredConflicts=filter==='coordination'||filter==='risk'?openConflicts:data.conflicts
 return <div className="airspace-workspace">
  <section className="airspace-summary">
   <SummaryCard label="Active TFRs" value={active.length} detail="Currently effective restrictions" toneName="cyan" active={filter==='active'} onClick={()=>setFilter(filter==='active'?null:'active')}/>
   <SummaryCard label="Coordination Issues" value={openConflicts.length} detail="Unresolved coordination actions" toneName="amber" active={filter==='coordination'} onClick={()=>setFilter(filter==='coordination'?null:'coordination')}/>
   <SummaryCard label="Missions at Risk" value={missionsAtRisk} detail="Missions with unresolved airspace risk" toneName="red" active={filter==='risk'} onClick={()=>setFilter(filter==='risk'?null:'risk')}/>
   <SummaryCard label="Upcoming Changes" value={upcoming.length} detail="Within 12 hours" toneName="green" active={filter==='upcoming'} onClick={()=>setFilter(filter==='upcoming'?null:'upcoming')}/>
  </section>
  <section className="airspace-main-grid">
   <section className="panel airspace-map-panel"><div className="panel-heading"><div><span className="eyebrow">Mission-Access Coordination</span><h3>Operational Airspace Picture</h3></div>{filter&&<button type="button" className="ghost-button" onClick={()=>setFilter(null)}>Clear Filter</button>}</div><AirspaceMap {...data} selection={selection} onSelect={setSelection}/></section>
   <StatusPanel selection={selection} data={data}/>
  </section>
  <section className="airspace-bottom-grid">
   <RecordsTable records={filteredRecords} selectedId={selection?.type==='airspace'?selection.id:null} onSelect={setSelection}/>
   <ConflictsTable conflicts={filteredConflicts} selectedId={selection?.type==='conflict'?selection.id:null} onSelect={setSelection} role={role} readOnly={readOnly} onUpdate={onUpdateAirspaceAction}/>
  </section>
 </div>
}
