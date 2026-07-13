import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ROLES } from '../../data/roles.js'
import AdvisorPanel from '../AdvisorPanel.jsx'
import Icon from '../../common/Icon.jsx'
const NAV = [
  ['mission', 'MISSION', 'mission'],
  ['current', 'CURRENT OPS', 'current-ops'],
  ['tomorrow', "TOMORROW'S PLAN", 'tomorrows-plan'],
  ['sync', 'SYNC MATRIX', 'sync-matrix'],
  ['requirements', 'REQUIREMENTS', 'requirements'],
  ['platforms', 'PLATFORMS', 'platforms'],
  ['upad', 'UPAD STATUS', 'upad-status'],
  ['airspace', 'AIRSPACE', 'airspace'],
  ['oversight', 'INTEL OVERSIGHT', 'intel-oversight'],
  ['updates', 'DEADLINES', 'deadlines'],
  ['log', 'DECISION LOG', 'decision-log'],
]

const roleCopy = {
  remote_sensing_coordinator:'Set regional priorities, allocate approved assets, protect missions, coordinate unmet needs, and approve tomorrow’s plan.',
  remote_sensing_manager:'Manage approved mission execution, sortie timing, operational retasking, and gain-loss assessment.',
  collection_manager:'Develop customer requirements, define EEIs, ensure taskability, and prepare approved requirements for tomorrow’s plan.',
  upad_lno:'Represent your UPAD, provide realistic status and production updates, coordinate needs and issues, and advise on capability and limitations.',
}

const fmt = (v,f='—') => v || f
const tone = (value='') => String(value).toLowerCase().replaceAll(' ','-').replaceAll('_','-')
const Panel = ({title,accent='cyan',children,className=''}) => <section className={`rx-panel ${accent} ${className}`}><div className="rx-panel-title">{title}</div>{children}</section>
const Button = ({children,onClick,disabled=false}) => <button className="rx-outline-button" onClick={onClick} disabled={disabled}>{children}</button>

function LiveHeader({role,missionState,onEnd}){
 const meta=ROLES.find(r=>r.id===role)
 const participant=missionState.exercise?.participantName?.trim()
 const identity=participant || meta?.name || 'Role not selected'
 return <header className="rx-header">
  <div className="rx-brand"><img src="/images/brand/nexus-rs-header-logo.png" alt="NEXUS RS — Remote Sensing Simulation Platform" className="rx-brand-image"/></div>
  <div className="rx-head-block"><span>ROLE</span><strong>{identity}</strong>{participant&&<small>{meta?.name}</small>}</div>
  <div className="rx-head-block"><span>SCENARIO</span><strong>{missionState.exercise?.scenarioName||missionState.scenario?.name||'Western Region Multi-Fire'}</strong></div>
  <div className="rx-head-block"><span>OPERATIONAL PERIOD</span><div className="rx-op-toggle"><b>OP {missionState.exercise?.activeOperationalPeriod||missionState.operationalPeriod||1}</b><span>OP 2</span></div></div>
  <div className="rx-head-block"><span>LOCAL INCIDENT TIME</span><strong>{missionState.exercise?.localIncidentTime||missionState.asOf||'1732L'}</strong><small>Period remains active</small></div>
  <div className="rx-header-actions"><button>☰<small>MENU</small></button>{onEnd&&<button className="rx-end" onClick={onEnd}>END EXERCISE</button>}</div>
 </header>
}

function Sidebar({role,active,onNavigate}){
 const meta=ROLES.find(r=>r.id===role)
 return <aside className="rx-sidebar">
  <nav>
  {NAV.map(([id, label, icon]) => (
    <button
      key={id}
      className={active === id ? 'active' : ''}
      onClick={() => onNavigate?.(id)}
    >
      <span>
        <Icon name={icon} size={24} />
      </span>
      {label}
    </button>
  ))}
</nav>
  <button className="rx-collapse">≪ &nbsp; COLLAPSE</button>
 </aside>
}

function CurrentPeriodCard({role,missionState}){
 const focus={
  remote_sensing_coordinator:'Life safety, current fire behavior, critical infrastructure',
  remote_sensing_manager:'Execute approved missions and respond to new requests',
  collection_manager:'Execute approved collections and respond to new requests',
  upad_lno:'Execute assigned production and report status',
 }[role]
 return <Panel title="CURRENT OPERATIONAL PERIOD (OP 1)" className="rx-top-card">
  <dl className="rx-key-list"><div><dt>◷ &nbsp; Time</dt><dd>{missionState.exercise?.localIncidentTime||'1732L'}</dd></div><div><dt>▣ &nbsp; End Time</dt><dd>1800L</dd></div><div><dt>◎ &nbsp; Focus</dt><dd>{focus}</dd></div></dl>
  <Button>VIEW CURRENT OP DETAILS</Button>
 </Panel>
}

function TomorrowCard({role,missionState,onNavigate}){
 const gaps=(missionState.tomorrowPlan?.blockers||[]).slice(0,3)
 return <Panel title="TOMORROW'S PLAN (OP 2)" accent="amber" className="rx-top-card">
  <dl className="rx-key-list"><div><dt>◷ &nbsp; Planning Window Closes</dt><dd>2130L</dd></div><div><dt>▣ &nbsp; OP 2 Begins</dt><dd>2200L</dd></div></dl>
  <div className="rx-gap-list"><strong>{role==='upad_lno'?'UPAD Commitments':'Top Planning Gaps'}</strong>{role==='upad_lno'?<b>6 / 11</b>:<ul>{(gaps.length?gaps:['Fire 1 – IMINT coverage gap late OP 2','Fire 2 – Change detection not scheduled']).map(x=><li key={x}>{x}</li>)}</ul>}</div>
  <Button onClick={()=>onNavigate?.('tomorrow')}>VIEW / BUILD TOMORROW'S PLAN</Button>
 </Panel>
}

function DeadlinesCard({role}){
 const title=role==='collection_manager'?'REQUIREMENT DEADLINES & WINDOWS':'MISSION DEADLINES & WINDOWS'
 return <Panel title={title} accent="red" className="rx-top-card">
  <div className="rx-deadlines">{[
   ['△','Fire 1 IMINT Product','OP 1','01:12:32'],
   ['▣','Fire 2 Change Detection','OP 1','00:47:32'],
   ['▣','Fire 3 Damage Assessment','OP 1','01:32:32'],
   ['◷',role==='collection_manager'?'New Requests Cutoff (OP 2)':'Tomorrow Plan Submit','OP 1','01:57:32'],
  ].map(x=><div key={x[1]}><span>{x[0]}</span><strong>{x[1]}</strong><em>{x[2]}</em><b>{x[3]}</b></div>)}</div>
  <Button>VIEW ALL DEADLINES</Button>
 </Panel>
}

function clamp(value,min,max){ return Math.max(min,Math.min(max,value)) }
function projectLatLng(lat,lng,zoom){
 const scale=256*(2**zoom)
 const x=(lng+180)/360*scale
 const sin=Math.sin(lat*Math.PI/180)
 const y=(.5-Math.log((1+sin)/(1-sin))/(4*Math.PI))*scale
 return {x,y}
}
function unprojectPoint(x,y,zoom){
 const scale=256*(2**zoom)
 const lng=x/scale*360-180
 const n=Math.PI-2*Math.PI*y/scale
 const lat=180/Math.PI*Math.atan(.5*(Math.exp(n)-Math.exp(-n)))
 return {lat,lng}
}

function OperationalMap({missionState}){
 const hostRef=useRef(null)
 const dragRef=useRef(null)
 const [size,setSize]=useState({width:700,height:310})
 const [view,setView]=useState({lat:39.55,lng:-121.55,zoom:8})

 useEffect(()=>{
  if(!hostRef.current) return
  const node=hostRef.current
  const update=()=>setSize({width:node.clientWidth,height:node.clientHeight})
  const handleWheel=(event)=>{
   event.preventDefault()
   event.stopPropagation()
   setView(current=>({...current,zoom:clamp(current.zoom+(event.deltaY<0?1:-1),5,13)}))
  }
  update()
  const observer=new ResizeObserver(update)
  observer.observe(node)
  node.addEventListener('wheel',handleWheel,{passive:false})
  return ()=>{
   observer.disconnect()
   node.removeEventListener('wheel',handleWheel)
  }
 },[])

 const centerWorld=projectLatLng(view.lat,view.lng,view.zoom)
 const topLeft={x:centerWorld.x-size.width/2,y:centerWorld.y-size.height/2}
 const tileSize=256
 const minX=Math.floor(topLeft.x/tileSize)
 const maxX=Math.floor((topLeft.x+size.width)/tileSize)
 const minY=Math.floor(topLeft.y/tileSize)
 const maxY=Math.floor((topLeft.y+size.height)/tileSize)
 const tiles=[]
 const tileCount=2**view.zoom
 for(let x=minX;x<=maxX;x+=1){
  for(let y=minY;y<=maxY;y+=1){
   if(y<0||y>=tileCount) continue
   const wrappedX=((x%tileCount)+tileCount)%tileCount
   tiles.push({key:`${x}-${y}`,x:(x*tileSize)-topLeft.x,y:(y*tileSize)-topLeft.y,url:`https://tile.openstreetmap.org/${view.zoom}/${wrappedX}/${y}.png`})
  }
 }

 const mapDefaults=[
  {lat:40.58,lng:-122.39,tone:'red'},
  {lat:40.17,lng:-122.24,tone:'orange'},
  {lat:39.73,lng:-121.84,tone:'amber'},
  {lat:40.42,lng:-120.65,tone:'red'},
  {lat:41.73,lng:-122.64,tone:'orange'},
 ]
 const incidents=(missionState.incidents||[]).slice(0,5).map((incident,index)=>({
  ...incident,
  id:incident.id||`incident-${index+1}`,
  name:incident.name||`Incident ${index+1}`,
  lat:Number(incident.lat)||mapDefaults[index%mapDefaults.length].lat,
  lng:Number(incident.lng)||mapDefaults[index%mapDefaults.length].lng,
  tone:mapDefaults[index%mapDefaults.length].tone,
 }))
 const missionDefaults=(missionState.currentOps?.missions||[]).slice(0,5).map((mission,index)=>({
  label:mission.callsign||mission.platform||`Asset ${index+1}`,
  lat:(incidents[index%Math.max(1,incidents.length)]?.lat||40)-.18,
  lng:(incidents[index%Math.max(1,incidents.length)]?.lng||-122)-.22,
 }))
 const missions=(missionState.currentOps?.missions||[]).slice(0,3)
 const markerPosition=(lat,lng)=>{
  const point=projectLatLng(lat,lng,view.zoom)
  return {left:point.x-topLeft.x,top:point.y-topLeft.y}
 }

 const pointerDown=(event)=>{
  event.currentTarget.setPointerCapture(event.pointerId)
  dragRef.current={x:event.clientX,y:event.clientY,center:projectLatLng(view.lat,view.lng,view.zoom)}
 }
 const pointerMove=(event)=>{
  if(!dragRef.current) return
  const dx=event.clientX-dragRef.current.x
  const dy=event.clientY-dragRef.current.y
  const next=unprojectPoint(dragRef.current.center.x-dx,dragRef.current.center.y-dy,view.zoom)
  setView(v=>({...v,lat:clamp(next.lat,-80,80),lng:next.lng}))
 }
 const pointerUp=(event)=>{
  dragRef.current=null
  try{event.currentTarget.releasePointerCapture(event.pointerId)}catch{}
 }
 const zoomBy=(amount)=>{
  setView(v=>({...v,zoom:clamp(v.zoom+amount,5,13)}))
 }
 const metersPerPixel=156543.03392*Math.cos(view.lat*Math.PI/180)/(2**view.zoom)
 const targetNauticalMiles=(metersPerPixel*120)/1852
 const magnitude=10**Math.floor(Math.log10(Math.max(targetNauticalMiles,.01)))
 const normalized=targetNauticalMiles/magnitude
 const niceFactor=normalized>=5?5:normalized>=2?2:1
 const scaleNauticalMiles=niceFactor*magnitude
 const scaleWidth=Math.max(42,Math.min(140,(scaleNauticalMiles*1852)/metersPerPixel))
 const halfScale=scaleNauticalMiles/2
 const formatScale=(value)=>value>=10?Math.round(value):value>=1?Number(value.toFixed(1)):Number(value.toFixed(2))

 return <div
  ref={hostRef}
  className="rx-operational-map"
  onPointerDown={pointerDown}
  onPointerMove={pointerMove}
  onPointerUp={pointerUp}
  onPointerCancel={pointerUp}
 >
  <div className="rx-map-tiles">{tiles.map(tile=><img key={tile.key} src={tile.url} alt="" draggable="false" style={{left:tile.x,top:tile.y}}/>)}</div>
  <svg className="rx-map-overlays" viewBox={`0 0 ${size.width} ${size.height}`} preserveAspectRatio="none" aria-hidden="true">
   {incidents.map((item)=>{
    const p=markerPosition(item.lat,item.lng)
    return <circle key={item.id} cx={p.left} cy={p.top} r="43" className={`rx-tfr-ring ${item.tone}`}/>
   })}
  </svg>
  <div className="rx-legend"><strong>LEGEND</strong>{incidents.map((item,index)=><span key={item.id}>{['🔴','🟠','🟡'][index%3]} {item.name}</span>)}<span>✈ Airborne Platform</span><span>◯ TFR / Airspace</span></div>
  {incidents.map(item=>{
   const p=markerPosition(item.lat,item.lng)
   return <button key={item.id} type="button" className={`rx-map-fire ${item.tone}`} style={{left:p.left,top:p.top}} title={item.name}>
    <span>🔥</span><b>{item.name}</b>
   </button>
  })}
  {missionDefaults.map((item,index)=>{
   const mission=missions[index]
   const p=markerPosition(item.lat,item.lng)
   return <button key={item.label} type="button" className="rx-map-aircraft" style={{left:p.left,top:p.top}} title={`${mission?.id||item.label}: ${mission?.objective||'Assigned mission'}`}>
    ✈ <b>{mission?.platform||mission?.assetId||item.label}</b>
   </button>
  })}
  <div className="rx-map-controls">
   <button type="button" onPointerDown={e=>e.stopPropagation()} onClick={()=>zoomBy(1)} title="Zoom in">＋</button>
   <button type="button" onPointerDown={e=>e.stopPropagation()} onClick={()=>zoomBy(-1)} title="Zoom out">−</button>
  </div>
  <div className="rx-map-scale" aria-label={`Map scale: ${formatScale(scaleNauticalMiles)} nautical miles`} style={{width:scaleWidth}}>
   <div className="rx-map-scale-labels"><span>0</span><span>{formatScale(halfScale)}</span><span>{formatScale(scaleNauticalMiles)} NM</span></div>
   <div className="rx-map-scale-line"><i/><i/><i/></div>
  </div>
  <div className="rx-map-attribution">© OpenStreetMap contributors</div>
 </div>
}

function RegionalMissionPicture({role,missionState}){
 return <Panel title="REGIONAL MISSION PICTURE – THREE FIRES" className="rx-map-panel">
  <OperationalMap missionState={missionState}/>
 </Panel>
}

function PlatformTable({missionState,onRelease,onUpdateMission,role}){
 const assets=missionState.assetControl?.assets||[]
 return <Panel title="PLATFORM ASSIGNMENTS & AVAILABILITY" className="rx-platform-panel">
  <table className="rx-table"><thead><tr><th>Platform</th><th>Status / Mission</th><th>Available</th><th>Next Available</th></tr></thead><tbody>
   {assets.slice(0,6).map(a=><tr key={a.id}><td>✈ &nbsp; {a.identifier}</td><td><i className={`rx-dot ${tone(a.status)}`}/>{a.status} – {a.assignment}</td><td>{a.status==='reserve'?'Now':'—'}</td><td>{a.status==='assigned'?'OP 2':'—'}</td>{role==='remote_sensing_manager'&&<td><select className="rx-inline-select" value={(missionState.currentOps?.missions||[]).find(m=>m.id===a.missionId)?.status||'planned'} onChange={e=>a.missionId&&onUpdateMission?.(a.missionId,{status:e.target.value})}><option value="planned">Planned</option><option value="launched">Launched</option><option value="on_station">On station</option><option value="collecting">Collecting</option><option value="returning">Returning</option><option value="landed">Landed</option><option value="delayed">Delayed</option><option value="unable">Unable</option></select></td>}</tr>)}
  </tbody></table>
  <Button onClick={role==='remote_sensing_coordinator'&&assets[0]?()=>onRelease?.(assets[0].id):undefined}>VIEW PLATFORM DETAILS</Button>
 </Panel>
}

function RequirementsSummary({missionState,onNavigate}){
 const reqs=missionState.requirements?.items||[]
 return <Panel title="CUSTOMER REQUIREMENTS & EEIs" accent="amber" className="rx-requirements-summary">
  <div className="rx-req-list">{reqs.slice(0,4).map(r=><article key={r.id}><strong>{r.fire||r.customer}</strong><em className={r.priority===1?'high':'med'}>{r.priority===1?'HIGH':'MED'}</em><p>{r.id.toUpperCase()} &nbsp; {r.title}</p><small>EEI: {(r.eeis||[]).slice(0,2).join(', ')||'Clarification required'}</small></article>)}</div>
  <Button onClick={()=>onNavigate?.('requirements')}>VIEW ALL REQUIREMENTS</Button>
 </Panel>
}


function MiniSyncMatrix({missionState,onNavigate}){
 const missions=missionState.currentOps?.missions||[]
 return <Panel title="SYNC MATRIX — CURRENT & NEAR-TERM" className="rx-mini-sync">
  <table className="rx-table"><thead><tr><th>MISSION</th><th>ASSET</th><th>REQUIREMENT</th><th>WINDOW</th><th>STATUS</th><th>PROT</th><th>PRODUCT</th></tr></thead><tbody>
   {missions.slice(0,5).map((m,i)=><tr key={m.id}><td><strong>{m.id}</strong></td><td>{m.platform||m.assetId||'—'}</td><td>{m.requirementId||m.requirement||'—'}</td><td>{m.window||m.startTime||'—'}</td><td><em className={tone(m.status||'planned')}>{String(m.status||'planned').replaceAll('_',' ')}</em></td><td>{m.protected?'◆':'—'}</td><td>{m.productStatus||['Pending','Planned','At Risk','Queued','—'][i]}</td></tr>)}
  </tbody></table>
  <Button onClick={()=>onNavigate?.('sync')}>OPEN FULL SYNC MATRIX</Button>
 </Panel>
}

function useStoredSize(key,initial,min,max){
 const [value,setValue]=useState(()=>{const saved=Number(localStorage.getItem(key));return Number.isFinite(saved)&&saved>=min&&saved<=max?saved:initial})
 useEffect(()=>localStorage.setItem(key,String(value)),[key,value])
 return [value,setValue]
}

function DragHandle({onDrag,className=''}) {
 const start=useRef(null)
 const move=(event)=>{
  if(!start.current) return
  const delta={dx:event.clientX-start.current.x,dy:event.clientY-start.current.y}
  start.current={x:event.clientX,y:event.clientY}
  onDrag(delta)
 }
 const stop=()=>{
  start.current=null
  window.removeEventListener('pointermove',move)
  window.removeEventListener('pointerup',stop)
 }
 const down=(event)=>{
  event.preventDefault()
  start.current={x:event.clientX,y:event.clientY}
  window.addEventListener('pointermove',move)
  window.addEventListener('pointerup',stop)
 }
 return <div className={`rx-drag-handle ${className}`} onPointerDown={down} role="separator" tabIndex="0" aria-label="Resize panels"/>
}

function useStoredFractions(key,initial){
 const [values,setValues]=useState(()=>{
  try{
   const saved=JSON.parse(localStorage.getItem(key)||'null')
   return Array.isArray(saved)&&saved.length===initial.length?saved:initial
  }catch{return initial}
 })
 useEffect(()=>localStorage.setItem(key,JSON.stringify(values)),[key,values])
 return [values,setValues]
}

function ResizableRow({storageKey,initial,min=12,className='',style,children}){
 const host=useRef(null)
 const [sizes,setSizes]=useStoredFractions(storageKey,initial)
 const items=React.Children.toArray(children)
 const resize=(index,delta)=>{
  const width=host.current?.clientWidth||1
  const pct=delta.dx/width*100
  setSizes(current=>{
   const next=[...current]
   const combined=next[index]+next[index+1]
   next[index]=clamp(next[index]+pct,min,combined-min)
   next[index+1]=combined-next[index]
   return next
  })
 }
 const columns=sizes.flatMap((size,index)=>index<sizes.length-1?[`minmax(0,${size}fr)`,'5px']:[`minmax(0,${size}fr)`]).join(' ')
 return <div ref={host} className={`rx-resizable-row ${className}`} style={{gridTemplateColumns:columns,...style}}>
  {items.map((child,index)=><React.Fragment key={index}>{child}{index<items.length-1&&<DragHandle className="vertical" onDrag={delta=>resize(index,delta)}/>}</React.Fragment>)}
 </div>
}

function ResizableStack({storageKey='nexus-rs-coordinator-stack-height',children}){
 const host=useRef(null)
 const [sizes,setSizes]=useStoredFractions(storageKey,[52,48])
 const items=React.Children.toArray(children)
 const resize=(delta)=>{
  const height=host.current?.clientHeight||1
  const pct=delta.dy/height*100
  setSizes(current=>{
   const total=current[0]+current[1]
   const first=clamp(current[0]+pct,30,total-30)
   return [first,total-first]
  })
 }
 return <div ref={host} className="rx-resizable-stack" style={{gridTemplateRows:`minmax(0,${sizes[0]}fr) 5px minmax(0,${sizes[1]}fr)`}}>
  {items[0]}<DragHandle className="horizontal" onDrag={resize}/>{items[1]}
 </div>
}

function UPADTable({missionState}){
 const deliveries=missionState.dissemination?.deliveries||[]
 return <Panel title="UPAD WORKLOAD & PRODUCTION" accent="purple" className="rx-upad-table">
  <table className="rx-table"><thead><tr><th>UPAD</th><th>Primary Task</th><th>Workload</th><th>Products Pending</th></tr></thead><tbody>
   {['UPAD 1 (North)','UPAD 2 (Central)','UPAD 3 (South)','UPAD 4 (Reserve)'].map((u,i)=><tr key={u}><td>{u}</td><td>{deliveries[i]?.productType||'Standby'}</td><td><span className="rx-load"><i style={{width:`${[78,92,61,0][i]}%`}}/></span>{[78,92,61,0][i]}%</td><td>{deliveries[i]?i+1:0}</td></tr>)}
  </tbody></table><Button>VIEW PRODUCTION DETAILS</Button>
 </Panel>
}

function AirspacePanel(){
 return <Panel title="AIRSPACE / TFR CONSTRAINTS" className="rx-small-list rx-bottom-button-panel"><ul>{['TFR – Fire 1 (VIP Visit)','TFR – Fire 2 (Aerial Operations)','TFR – Fire 3 (Aviation Hazard)','MOA – R-2505','Severed Airspace – North'].map((x,i)=><li key={x}>{x}<span><i className={`rx-dot ${i===4?'amber':'red'}`}/>{i===4?'Advisory':'Active'}</span></li>)}</ul><div style={{marginTop:'auto'}}><Button>VIEW AIRSPACE DETAIL</Button></div></Panel>
}

function OversightPanel({missionState}){
 const cases=missionState.oversight?.cases||[]
 return <Panel title="INTELLIGENCE OVERSIGHT" accent="purple" className="rx-small-list rx-bottom-button-panel"><ul>{(cases.length?cases:[
  {title:'Collection over populated area',severity:'medium'},{title:'Need-to-know validation',severity:'medium'},{title:'Potential privacy concern',severity:'low'}
 ]).slice(0,4).map((x,i)=><li key={x.id||x.title}>{x.title||x.concern}<em className={tone(x.severity||'medium')}>{(x.severity||'MED').toUpperCase()}</em></li>)}</ul><div style={{marginTop:'auto'}}><Button>VIEW IO GUIDANCE</Button></div></Panel>
}

function DecisionWindows(){
 return <Panel title="KEY DECISION WINDOWS"><ul className="rx-window-list">{[['Retask vs Stay (Vulcan 01)','00:32:32'],['Accept CAL OES Request','00:27:32'],['UPAD 2 Reallocation','00:42:32'],['Tomorrow Plan Priorities','01:57:32']].map(x=><li key={x[0]}><span>{x[0]}</span><b>{x[1]}</b></li>)}</ul><Button>VIEW DECISION LOG</Button></Panel>
}

function AdvisorColumn(props){
 return <aside className="rx-advisor-column">
  <AdvisorPanel {...props}/>
 </aside>
}

function RequirementDevelopment({
 missionState,
 onUpdateRequirement,
 onValidateRequirement,
 onAddToDeck,
 selectedRequirementId,
 onSelectRequirement,
}){
 const reqs=missionState.requirements?.items||[]
 const selected=reqs.find(r=>r.id===selectedRequirementId)||reqs.find(r=>r.status==='needs_clarification')||reqs[0]||{}
 const [draft,setDraft]=useState(selected)

 useEffect(()=>setDraft(selected),[selected?.id])

 const update=(field,value)=>setDraft(current=>({...current,[field]:value}))
 const addToDeck=()=>{
  onUpdateRequirement?.(selected.id,draft)
  onValidateRequirement?.(selected.id)
  onAddToDeck?.({...selected,...draft,status:'ready'})
 }

 return <Panel title="REQUIREMENTS DEVELOPMENT WORKSPACE" className="rx-requirement-workspace">
  <ResizableRow storageKey="nexus-rs-cm-requirement-stages-v1" initial={[24,33,43]} min={18} className="rx-cm-requirement-stages">
   <section className="rx-cm-stage incoming">
    <h4>1. INCOMING REQUEST</h4>
    <p className="rx-cm-stage-help">Original request exactly as received.</p>
    <div className="rx-cm-incoming-list">
     {reqs.slice(0,7).map(requirement=><button
      className={`rx-queue-item ${requirement.id===selected.id?'selected':''}`}
      key={requirement.id}
      onClick={()=>onSelectRequirement?.(requirement.id)}
     >
      <strong>{String(requirement.id||'').toUpperCase()} · {requirement.fire||requirement.incident||'Incident'}</strong>
      <span>{requirement.title||requirement.what||'Incoming customer request'}</span>
      <em>{String(requirement.status||'incoming').replaceAll('_',' ')}</em>
     </button>)}
    </div>
   </section>

   <section className="rx-cm-stage customer">
    <h4>2. CUSTOMER REQUIREMENT</h4>
    <p className="rx-cm-stage-help">Clarify the decision, customer need, location, timing, and desired effect.</p>
    <div className="rx-form-grid rx-cm-customer-form">
     <label>Request ID<input value={selected.id||''} disabled/></label>
     <label>Customer<input value={draft.customer||''} onChange={event=>update('customer',event.target.value)}/></label>
     <label className="wide">Decision to Support<textarea value={draft.decisionToSupport||''} onChange={event=>update('decisionToSupport',event.target.value)}/></label>
     <label className="wide">Customer Information Need<textarea value={draft.customerNeed||draft.what||''} onChange={event=>update('customerNeed',event.target.value)}/></label>
     <label>Location / Area<input value={draft.location||draft.fire||draft.incident||''} onChange={event=>update('location',event.target.value)}/></label>
     <label>Desired By / LTIOV<input value={draft.when||draft.ltiov||''} onChange={event=>update('when',event.target.value)}/></label>
     <label>Desired Product / Effect<input value={draft.desiredProduct||draft.requiredEffect||''} onChange={event=>update('desiredProduct',event.target.value)}/></label>
     <label>Priority<select value={String(draft.priority||'2')} onChange={event=>update('priority',event.target.value)}>
      <option value="1">Priority 1</option><option value="2">Priority 2</option><option value="3">Priority 3</option>
     </select></label>
    </div>
   </section>

   <section className="rx-cm-stage refined">
    <h4>3. REFINED COLLECTION REQUIREMENT</h4>
    <p className="rx-cm-stage-help">Create the taskable collection requirement that can be assigned to a sortie deck.</p>
    <div className="rx-form-grid rx-cm-refined-form">
     <label>Location / NAI<input value={draft.nai||draft.location||''} onChange={event=>update('nai',event.target.value)}/></label>
     <label>Required Capability<input value={draft.requiredCapability||draft.requiredEffect||''} onChange={event=>update('requiredCapability',event.target.value)}/></label>
     <label className="wide">Refined Information Need / Description<textarea value={draft.what||''} onChange={event=>update('what',event.target.value)}/></label>
     <label className="wide">Essential Elements of Information (EEIs)<textarea value={(draft.eeis||[]).join('\n')} onChange={event=>update('eeis',event.target.value.split('\n').filter(Boolean))}/></label>
     <label>Acquisition Window<select value={draft.collectionWindow||'OP 2'} onChange={event=>update('collectionWindow',event.target.value)}><option>OP 1</option><option>OP 2</option></select></label>
     <label>Alternate Sources<input value={draft.alternateSource||''} onChange={event=>update('alternateSource',event.target.value)}/></label>
     <label>Reporting Instructions<input value={draft.reporting||''} onChange={event=>update('reporting',event.target.value)}/></label>
     <label>Special Instructions<input value={draft.specialInstructions||''} onChange={event=>update('specialInstructions',event.target.value)}/></label>
    </div>
    <div className="rx-form-actions">
     <span>Feasibility <b>{draft.status==='ready'?'READY':'PENDING REVIEW'}</b></span>
     <button onClick={addToDeck}>ADD TO COLLECTION DECK</button>
    </div>
   </section>
  </ResizableRow>
 </Panel>
}

function Taskability({
 selectedRequirement,
 deckItems,
 sorties,
 onAssignRequirement,
 onViewAllSorties,
 currentTime='1732L',
}){
 const requirement=selectedRequirement||{}
 const requirementId=requirement.id
 const incident=String(requirement.fire||requirement.incident||requirement.location||'').trim()
 const incidentCode=(incident.split(/\s+/).filter(Boolean).map(word=>word[0]).join('').toUpperCase()||'TK').slice(0,4)
 const numericId=String(requirement.id||'').match(/\d+/)?.[0]||String((deckItems||[]).findIndex(item=>item.id===requirement.id)+1||1).padStart(3,'0')
 const taskId=`${incidentCode}-${String(numericId).padStart(3,'0')}`
 const taskTitle=String(requirement.title||requirement.what||requirement.customerNeed||'Collection Requirement').replace(/^REQ[-\s\w]*[:–—-]\s*/i,'').slice(0,54)
 const assignedItem=(deckItems||[]).find(item=>item.id===requirementId)
 const currentMinutes=(()=>{
  const digits=String(currentTime).replace(/[^\d]/g,'').padStart(4,'0').slice(0,4)
  return Number(digits.slice(0,2))*60+Number(digits.slice(2))
 })()
 const ltiovMinutes=(()=>{
  const digits=String(requirement.when||requirement.ltiov||'').replace(/[^\d]/g,'').padStart(4,'0').slice(0,4)
  return digits==='0000'?null:Number(digits.slice(0,2))*60+Number(digits.slice(2))
 })()
 const remaining=ltiovMinutes==null?null:ltiovMinutes-currentMinutes

 const options=(sorties||[]).map(sortie=>{
  const required=String(requirement.requiredCapability||requirement.requiredEffect||requirement.desiredProduct||'').toLowerCase()
  const capability=String(sortie.capability||'').toLowerCase()
  const capabilityMatch=!required||!capability||capability.includes(required.split('/')[0])||required.includes(capability.split('/')[0])
  const ltiov=Number(String(requirement.when||requirement.ltiov||'').replace(/[^\d]/g,'').slice(0,2))
  const timeMatch=!ltiov||sortie.end<=ltiov
  const assignedCount=(deckItems||[]).filter(item=>item.assignedSortieId===sortie.id).length
  const incidentMatch=String(sortie.primaryIncident||'').toLowerCase()===incident.toLowerCase()
  const airspaceWarning=incidentMatch&&incident?`AIRSPACE COORDINATION — ${incident.toUpperCase()}`:null
  const fitScore=(capabilityMatch?4:0)+(timeMatch?3:0)+(incidentMatch?2:0)-Math.min(assignedCount,4)
  const fit=fitScore>=7?'GOOD FIT':fitScore>=3?'MODERATE FIT':'LIMITED FIT'
  const warnings=[
   !capabilityMatch?'Capability requires review':null,
   !timeMatch?'LTIOV AT RISK':null,
   remaining!==null&&remaining<=90?`LTIOV ${remaining<=0?'EXPIRED':`${Math.floor(Math.max(0,remaining)/60)}:${String(Math.max(0,remaining)%60).padStart(2,'0')} REMAINING`}`:null,
   airspaceWarning,
   !incidentMatch?'Cross-incident route opportunity':null,
   assignedCount>=4?`${assignedCount} TASKS ALREADY ON DECK`:null,
  ].filter(Boolean)
  return {...sortie,capabilityMatch,timeMatch,assignedCount,incidentMatch,fit,fitScore,warnings}
 }).sort((a,b)=>b.fitScore-a.fitScore)

 const topOptions=options.slice(0,3)

 return <Panel title="TASKABILITY & COLLECTION OPTIONS" className="rx-taskability rx-taskability-options">
  <div className="rx-taskability-selected">
   <div className="task"><span>SELECTED REQUIREMENT</span><strong>{taskId}</strong><small>{taskTitle}</small></div>
   <div><span>LOCATION / NAI</span><strong>{requirement.nai||requirement.location||requirement.fire||requirement.incident||'—'}</strong></div>
   <div><span>LTIOV</span><strong>{requirement.when||requirement.ltiov||'—'}</strong>{remaining!==null&&<small className={remaining<=90?'warning':''}>{remaining<=0?'EXPIRED':`${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')} REMAINING`}</small>}</div>
   <div><span>REQUIRED CAPABILITY</span><strong>{requirement.requiredCapability||requirement.requiredEffect||requirement.desiredProduct||'—'}</strong></div>
  </div>
  <div className="rx-taskability-options-title"><strong>BEST COLLECTION OPTIONS</strong><button onClick={onViewAllSorties}>VIEW ALL {options.length} SORTIES</button></div>
  <div className="rx-taskability-options-list">
   {topOptions.map(option=><article className={`rx-taskability-option ${assignedItem?.assignedSortieId===option.id?'assigned':''}`} key={option.id}>
    <header><div><strong>{option.label}</strong><span>{option.primaryIncident} · {option.assetType||option.asset} · {option.window}</span></div><em className={option.fit==='GOOD FIT'?'good':option.fit==='MODERATE FIT'?'med':'high'}>{option.fit}</em></header>
    <dl><div><dt>Capability</dt><dd>{option.capabilityMatch?'Supports requirement':'Review mismatch'}</dd></div><div><dt>Timing</dt><dd>{option.timeMatch?'Supports LTIOV':'LTIOV at risk'}</dd></div><div><dt>Deck Load</dt><dd>{option.assignedCount} assigned</dd></div></dl>
    {option.warnings.length>0&&<ul>{option.warnings.map(warning=><li key={warning}>{warning}</li>)}</ul>}
    <button disabled={!requirementId} onClick={()=>onAssignRequirement?.(requirement,option.id)}>{assignedItem?.assignedSortieId===option.id?'ASSIGNED TO THIS SORTIE':'ASSIGN TO SORTIE'}</button>
   </article>)}
  </div>
 </Panel>
}

function UPADOverview({missionState,onUpdateDelivery}){
 const deliveries=missionState.dissemination?.deliveries||[]
 return <Panel title="UPAD STATUS & PRODUCTION OVERVIEW" className="rx-upad-overview">
  <table className="rx-table"><thead><tr><th>UPAD</th><th>Location</th><th>Primary Tasking (Current)</th><th>Workload</th><th>On-Time</th><th>At Risk</th><th>Overdue</th><th>Products Pending</th><th>Issues / Notes</th><th>Comm Status</th></tr></thead><tbody>
  {['UPAD 1 (North)','UPAD 2 (Central)','UPAD 3 (South)','UPAD 4 (Reserve)'].map((u,i)=><tr key={u}><td><strong>{u}</strong></td><td>{['Reno, NV','Salt Lake City, UT','Phoenix, AZ','Albuquerque, NM'][i]}</td><td>{deliveries[i]?.productType||'Standby / Fill-in'}</td><td><span className="rx-load"><i style={{width:`${[86,92,78,22][i]}%`}}/></span>{[86,92,78,22][i]}%</td><td>{[2,1,2,0][i]}</td><td>{[1,2,0,0][i]}</td><td>{[1,2,1,0][i]}</td><td>{[4,5,3,0][i]}</td><td>{['Bandwidth limited','Pilot rest window','High queue','Available if tasked'][i]}</td><td><em className={i===2?'med':'good'}>{i===2?'DEGRADED':'GOOD'}</em></td></tr>)}
  </tbody></table><Button onClick={deliveries[0]?()=>onUpdateDelivery?.(deliveries[0].id,{processingStatus:'processing'}):undefined}>VIEW DETAILED PRODUCTION BOARD</Button>
 </Panel>
}

function CoordinatorView(props){
 const {missionState,role,onNavigate,onReleaseAsset}=props
 const [middleHeight,setMiddleHeight]=useStoredSize('nexus-rs-coordinator-middle-height',500,360,760)
 const resizeMiddle=(delta)=>setMiddleHeight(value=>clamp(value+delta.dy,360,760))
 return <div className="rx-role-layout coordinator">
  <ResizableRow storageKey="nexus-rs-coordinator-top-panels" initial={[31,32,37]} min={20} className="rx-top-grid rx-top-grid-resizable">
   <CurrentPeriodCard role={role} missionState={missionState}/>
   <TomorrowCard role={role} missionState={missionState} onNavigate={onNavigate}/>
   <DeadlinesCard role={role}/>
  </ResizableRow>

  <ResizableRow storageKey="nexus-rs-coordinator-middle-panels" initial={[63,37]} min={24} className="rx-coordinator-middle rx-coordinator-middle-resizable" style={{height:middleHeight}}>
   <RegionalMissionPicture role={role} missionState={missionState}/>
   <ResizableStack>
    <PlatformTable missionState={missionState} role={role} onRelease={onReleaseAsset}/>
    <UPADTable missionState={missionState}/>
   </ResizableStack>
  </ResizableRow>
  <DragHandle className="horizontal rx-middle-bottom-handle" onDrag={resizeMiddle}/>

  <ResizableRow storageKey="nexus-rs-coordinator-lower-panels" initial={[40,20,19,21]} min={13} className="rx-coordinator-lower rx-coordinator-lower-resizable">
   <MiniSyncMatrix missionState={missionState} onNavigate={onNavigate}/>
   <AirspacePanel/>
   <OversightPanel missionState={missionState}/>
   <DecisionWindows/>
  </ResizableRow>
 </div>
}
function ManagerView(props){
 const {missionState,role,onNavigate,onUpdateMission}=props
 const [middleHeight,setMiddleHeight]=useStoredSize('nexus-rs-manager-middle-height',500,360,760)
 const resizeMiddle=(delta)=>setMiddleHeight(value=>clamp(value+delta.dy,360,760))

 return <div className="rx-role-layout manager">
  <style>{`
   .rx-manager-top-grid{align-items:stretch}
   .rx-manager-top-grid>.rx-panel{min-height:0;height:100%;display:flex;flex-direction:column}
   .rx-manager-top-grid>.rx-panel>.rx-outline-button{margin-top:auto}
   .rx-manager-top-grid .rx-panel-body{padding-top:8px;padding-bottom:8px}
   .rx-bottom-button-panel{display:flex;flex-direction:column}
   .rx-bottom-button-panel>div:last-child{width:100%}
   .rx-bottom-button-panel>div:last-child>.rx-outline-button{width:100%}
   .rx-manager-top-grid>.rx-small-list>.rx-outline-button{margin-top:auto}
   .rx-three-grid>.rx-small-list{display:flex;flex-direction:column}
   .rx-three-grid>.rx-small-list>.rx-outline-button{margin-top:auto}
  `}</style>

  <ResizableRow storageKey="nexus-rs-manager-top-panels-v3" initial={[27,31,19,23]} min={15} className="rx-top-grid rx-manager-top-grid">
   <CurrentPeriodCard role={role} missionState={missionState}/>
   <TomorrowCard role={role} missionState={missionState} onNavigate={onNavigate}/>
   <OversightPanel missionState={missionState}/>
   <DeadlinesCard role={role}/>
  </ResizableRow>

  <ResizableRow storageKey="nexus-rs-manager-middle-panels" initial={[62,38]} min={28} className="rx-manager-main rx-coordinator-middle-resizable" style={{height:middleHeight}}>
   <RegionalMissionPicture role={role} missionState={missionState}/>
   <RequirementsSummary missionState={missionState} onNavigate={onNavigate}/>
  </ResizableRow>
  <DragHandle className="horizontal rx-middle-bottom-handle" onDrag={resizeMiddle}/>

  <ResizableRow storageKey="nexus-rs-manager-operations-panels" initial={[45,28,27]} min={18} className="rx-three-grid">
   <PlatformTable missionState={missionState} role={role} onUpdateMission={onUpdateMission}/>
   <UPADTable missionState={missionState}/>
   <AirspacePanel/>
  </ResizableRow>
 </div>
}
function buildDeckRow(requirement,index){
 const fire=requirement.fire||requirement.incident||`Collection Area ${index+1}`
 const eeis=requirement.eeis||[]
 return {
  id:String(requirement.id||`REQ-${index+1}`).toUpperCase(),
  priority:String(requirement.priority||(['HIGH','HIGH','MED'][index]||'MED')).toUpperCase(),
  state:requirement.state||'CA',
  location:requirement.nai||requirement.location||fire,
  description:requirement.locationDescription||requirement.what||requirement.title||'Collection requirement',
  centerPoint:requirement.centerPoint||['39.74,-121.62','39.52,-121.31','39.17,-121.78'][index%3],
  radius:requirement.radius||'2 NM',
  pir:requirement.pir||`PIR-${String(index+1).padStart(2,'0')}`,
  eei:eeis.length?eeis.join('; '):(requirement.what||requirement.title||'Assess incident effects'),
  capability:requirement.requiredCapability||requirement.requiredEffect||['EO/IR','EO / Still Imagery','Wide Area EO'][index%3],
  resolution:requirement.resolution||['≤ 1 m','≤ 0.5 m','≤ 1 m'][index%3],
  periodicity:requirement.periodicity||'One pass',
  justification:requirement.justification||requirement.decisionToSupport||'Supports incident decision-making',
  preEvent:requirement.preEvent||'If available',
  ltiov:requirement.when||requirement.ltiov||['1500L','1630L','1800L'][index%3],
  acquisitionStart:requirement.acquisitionStart||['1300L','1430L','1600L'][index%3],
  acquisitionEnd:requirement.acquisitionEnd||['1430L','1600L','1730L'][index%3],
  reporting:requirement.reporting||'Report collection complete and imagery availability',
  special:requirement.specialInstructions||'Coordinate with Airspace Manager; avoid unnecessary collection',
  status:String(requirement.status||'READY').replaceAll('_',' ').toUpperCase(),
 }
}

function CollectionDeckOutput({items,onClose}){
 const rows=items.map(buildDeckRow)
 return <div className="rx-deck-modal" role="dialog" aria-modal="true" aria-label="Collection Deck">
  <div className="rx-deck-modal-card">
   <header>
    <div>
     <span>COLLECTION DECK OUTPUT</span>
     <h2>OP 2 — SORTIE 01</h2>
     <p>California Wildfire Complex · Remote Sensing Collection Plan</p>
    </div>
    <button onClick={onClose}>CLOSE</button>
   </header>
   <div className="rx-deck-summary">
    <div><span>UNIT TRACKING NUMBER</span><strong>CA-RS-OP2-001</strong></div>
    <div><span>EVENT / OPERATION</span><strong>California Wildfire Complex</strong></div>
    <div><span>DISSEMINATION</span><strong>Mission partners / approved customers</strong></div>
    <div><span>PRODUCT CLASSIFICATION</span><strong>UNCLASSIFIED</strong></div>
   </div>
   <div className="rx-deck-table-wrap">
    <table className="rx-deck-full-table">
     <thead><tr>
      <th>TASK ID</th><th>PRI</th><th>STATE / INCIDENT</th><th>LOCATION</th><th>LOCATION DESCRIPTION</th>
      <th>CUSTOMER</th><th>CUSTOMER NEED</th><th>DECISION TO SUPPORT</th><th>EEIs</th>
      <th>LTIOV</th><th>ACQ START</th><th>ACQ END</th><th>ASSIGNED SORTIE</th><th>COLLECTION SEQUENCE</th>
      <th>CENTER POINT</th><th>RADIUS</th><th>PIR</th>
      <th>REQUIRED CAPABILITY</th><th>RESOLUTION</th><th>PERIODICITY</th><th>JUSTIFICATION</th>
      <th>PRE-EVENT</th><th>REPORTING INSTRUCTIONS</th><th>SPECIAL INSTRUCTIONS</th><th>STATUS</th>
     </tr></thead>
     <tbody>{rows.map(row=><tr key={row.id}>
      <td>{row.id}</td><td><em className={tone(row.priority)}>{row.priority}</em></td><td>{items[rows.indexOf(row)]?.fire||items[rows.indexOf(row)]?.incident||row.state}</td>
      <td>{row.location}</td><td>{row.description}</td><td>{items[rows.indexOf(row)]?.customer||'—'}</td>
      <td>{items[rows.indexOf(row)]?.customerNeed||items[rows.indexOf(row)]?.what||row.description}</td>
      <td>{items[rows.indexOf(row)]?.decisionToSupport||row.justification}</td><td>{row.eei}</td>
      <td>{row.ltiov}</td><td>{row.acquisitionStart}</td><td>{row.acquisitionEnd}</td>
      <td>{items[rows.indexOf(row)]?.assignedSortieLabel||'UNASSIGNED'}</td><td>{items[rows.indexOf(row)]?.deckSequence||'—'}</td>
      <td>{row.centerPoint}</td><td>{row.radius}</td><td>{row.pir}</td><td>{row.capability}</td><td>{row.resolution}</td>
      <td>{row.periodicity}</td><td>{row.justification}</td><td>{row.preEvent}</td><td>{row.reporting}</td>
      <td>{row.special}</td><td>{row.status}</td>
     </tr>)}</tbody>
    </table>
   </div>
   <footer>
    <span>{rows.length} COLLECTION REQUIREMENTS · {rows.filter(r=>r.status.includes('READY')).length} READY</span>
    <button onClick={()=>window.print()}>PRINT / SAVE DECK</button>
   </footer>
  </div>
 </div>
}

function AllSortiesModal({
 requirement,
 deckItems,
 sorties,
 onAssign,
 onClose,
}){
 return <div className="rx-sortie-picker-modal" role="dialog" aria-modal="true" aria-label="All available sorties">
  <div className="rx-sortie-picker-card">
   <header>
    <div><span>ALL COLLECTION OPTIONS</span><h2>{String(requirement?.id||'SELECTED REQUIREMENT').toUpperCase()}</h2><p>Compare all planned sorties before assigning the collection requirement.</p></div>
    <button onClick={onClose}>CLOSE</button>
   </header>
   <div className="rx-sortie-picker-table">
    <div className="head"><span>SORTIE</span><span>PRIMARY INCIDENT</span><span>AIRCRAFT</span><span>WINDOW</span><span>CAPABILITY</span><span>DECK LOAD</span><span>ACTION</span></div>
    {sorties.map(sortie=>{
      const count=deckItems.filter(item=>item.assignedSortieId===sortie.id).length
      const assigned=deckItems.find(item=>item.id===requirement?.id)?.assignedSortieId===sortie.id
      return <div className="row" key={sortie.id}>
       <strong>{sortie.label}</strong><span>{sortie.primaryIncident}</span><span>{sortie.asset}</span><span>{sortie.window}</span><span>{sortie.capability}</span><span>{count} requirements</span>
       <button onClick={()=>{onAssign?.(requirement,sortie.id);onClose?.()}}>{assigned?'ASSIGNED':'ASSIGN'}</button>
      </div>
    })}
   </div>
  </div>
 </div>
}

function ActiveCollectionDeck({
 items,
 sorties,
 onAssignSortie,
 onOpenDeck,
 onOpenOutput,
}){
 const rows=items.map(buildDeckRow)
 const assignedCount=items.filter(item=>item.assignedSortieId).length
 return <Panel title="ACTIVE COLLECTION DECK / SORTIE ASSIGNMENT" className="rx-active-deck">
  <div className="rx-active-deck-meta">
   <span><b>{rows.length}</b> REQUIREMENTS</span>
   <span><b>{assignedCount}</b> ASSIGNED</span>
   <span><b>{rows.length-assignedCount}</b> UNASSIGNED</span>
  </div>
  <div className="rx-deck-assignment-table">
   <div className="head"><span>TASK ID</span><span>PRI</span><span>INCIDENT / LOCATION</span><span>LTIOV</span><span>ASSIGNED SORTIE</span><span>ACTION</span></div>
   {items.slice(0,10).map((item,index)=>{
    const row=buildDeckRow(item,index)
    return <div className="row" key={row.id}>
     <strong>{row.id}</strong>
     <span><em className={tone(row.priority)}>{row.priority}</em></span>
     <span>{item.fire||item.incident||row.location} · {row.location}</span>
     <span>{row.ltiov}</span>
     <select value={item.assignedSortieId||''} onChange={event=>onAssignSortie?.(item.id,event.target.value)}>
      <option value="">UNASSIGNED</option>
      {sorties.map(sortie=><option value={sortie.id} key={sortie.id}>{sortie.label}</option>)}
     </select>
     <button disabled={!item.assignedSortieId} onClick={()=>onOpenDeck?.(item.assignedSortieId)}>OPEN DECK</button>
    </div>
   })}
  </div>
  <Button onClick={onOpenOutput}>OPEN FULL COLLECTION DECK OUTPUT</Button>
 </Panel>
}

function SortieDeckEditor({
 sortie,
 items,
 onClose,
 onMove,
}){
 const ordered=[...items].sort((a,b)=>(a.deckSequence||999)-(b.deckSequence||999))
 const move=(index,direction)=>{
  const target=index+direction
  if(target<0||target>=ordered.length) return
  onMove?.(sortie.id,ordered[index].id,ordered[target].id)
 }

 return <div className="rx-sortie-deck-modal" role="dialog" aria-modal="true" aria-label={`${sortie.label} collection deck`}>
  <div className="rx-sortie-deck-card">
   <header>
    <div><span>SORTIE COLLECTION DECK</span><h2>{sortie.label}</h2><p>{sortie.primaryIncident} · {sortie.window} · Order Task IDs in the sequence the aircraft should collect them.</p></div>
    <button onClick={onClose}>CLOSE</button>
   </header>

   <div className="rx-sortie-deck-route">
    {ordered.map((item,index)=><div key={item.id}><b>{index+1}</b><span>{item.nai||item.location||item.fire||item.incident||item.id}</span></div>)}
   </div>

   <div className="rx-sortie-deck-table rx-upad-deck-table">
    <div className="head"><span>TASK ID</span><span>SEQ</span><span>PRI</span><span>INCIDENT / LOCATION</span><span>CUSTOMER NEED</span><span>EEIs</span><span>LTIOV</span><span>ORDER</span></div>
    {ordered.map((item,index)=><div className="row" key={item.id} draggable
      onDragStart={event=>event.dataTransfer.setData('text/plain',item.id)}
      onDragOver={event=>event.preventDefault()}
      onDrop={event=>{event.preventDefault();const dragged=event.dataTransfer.getData('text/plain');if(dragged&&dragged!==item.id) onMove?.(sortie.id,dragged,item.id)}}
    >
     <b>{String(item.id||'').toUpperCase()}</b>
     <strong>{index+1}</strong>
     <em className={tone(item.priority)}>{String(item.priority||'2').toUpperCase()}</em>
     <span>{item.fire||item.incident||'—'} · {item.nai||item.location||'—'}</span>
     <span>{item.customerNeed||item.what||item.title||'Collection requirement'}</span>
     <span>{(item.eeis||[]).join('; ')||'EEIs require refinement'}</span>
     <span>{item.when||item.ltiov||'—'}</span>
     <span className="actions"><button disabled={index===0} onClick={()=>move(index,-1)}>MOVE UP</button><button disabled={index===ordered.length-1} onClick={()=>move(index,1)}>MOVE DOWN</button></span>
    </div>)}
   </div>

   <footer>
    <div><strong>UPAD NOTE</strong><span>This deck preserves the customer need and EEIs so UPAD personnel know what to look for in the imagery.</span></div>
    <button onClick={onClose}>SAVE DECK ORDER</button>
   </footer>
  </div>
 </div>
}

function CollectionSyncPreview({title,subtitle,items,draft=false,onOpen,sorties=[],currentTime='1732L'}){
 const sortieById=Object.fromEntries(sorties.map(sortie=>[sortie.id,sortie]))
 const callsignFor=asset=>{
  const value=String(asset||'')
  if(value.toUpperCase().includes('MQ-9')||value.toUpperCase().includes('MQ9')) return 'GARGOYLE'
  if(value.toUpperCase().includes('UH-72')||value.toUpperCase().includes('UH-72')) return 'UH-72'
  if(value.toUpperCase().includes('CAP')) return 'CAP'
  return value||'UNASSIGNED'
 }
 const rows=(items||[]).slice(0,8).map((item,index)=>{
  const assigned=sortieById[item.assignedSortieId]
  const sequence=Math.max(1,Number(item.deckSequence)||index+1)
  const baseStart=Number(assigned?.start||String(item.start||item.acquisitionStart||[9,11,13,15,17][index]).replace(/[^\d]/g,'').slice(0,2))||[9,11,13,15,17][index]
  const start=Math.min(23,baseStart+Math.max(0,sequence-1))
  const end=Math.min(24,start+1)
  return {id:item.id||`REQ-${index+1}`,asset:assigned?.callsign||callsignFor(assigned?.asset||item.asset||item.platform||item.requiredPlatform),requirement:item.requirement||item.id||`REQ-${index+1}`,area:item.fire||item.incident||item.location||item.nai||`Collection Area ${index+1}`,start,end,status:assigned?`SEQ ${sequence}`:'UNASSIGNED'}
 })
 const minHour=Math.min(6,...rows.map(row=>row.start))
 const maxHour=Math.max(22,...rows.map(row=>row.end))
 const span=Math.max(1,maxHour-minHour)
 const left=row=>`${((row.start-minHour)/span)*100}%`
 const width=row=>`${Math.max(6,((row.end-row.start)/span)*100)}%`
 const timeDigits=String(currentTime).replace(/[^\d]/g,'').padStart(4,'0').slice(0,4)
 const currentDecimal=Number(timeDigits.slice(0,2))+Number(timeDigits.slice(2))/60
 const currentLeft=Math.max(0,Math.min(100,((currentDecimal-minHour)/span)*100))

 return <Panel title={title} className={`rx-collection-sync-preview ${draft?'draft':''}`}>
  <div className="rx-collection-sync-subtitle">{subtitle}</div>
  <div className="rx-collection-sync-hours">{[minHour,Math.round((minHour+maxHour)/2),maxHour].map(hour=><span key={hour}>{String(hour).padStart(2,'0')}00</span>)}</div>
  <div className="rx-collection-sync-body">
   {!draft&&currentDecimal>=minHour&&currentDecimal<=maxHour&&<div className="rx-sync-now-line" style={{left:`calc(106px + (100% - 190px) * ${currentLeft/100})`}}><span>{timeDigits}L</span></div>}
   {rows.length?rows.map(row=><div className="rx-collection-sync-row" key={`${row.asset}-${row.id}`}><strong>{row.asset}</strong><div className="rx-collection-sync-track"><span className={`rx-collection-sync-block ${draft?'draft':''}`} style={{left:left(row),width:width(row)}}><b>{String(row.requirement).toUpperCase()}</b><small>{row.area}</small></span></div><em>{row.status}</em></div>):<div className="rx-collection-sync-empty">No collection activity is available for this view.</div>}
  </div>
  <Button onClick={onOpen}>VIEW FULL SYNC MATRIX</Button>
 </Panel>
}

function CollectionView(props){
 const {missionState,role,onNavigate,onUpdateRequirement,onValidateRequirement,onSendRequirementForward}=props
 const requirements=missionState.requirements?.items||[]
 const todaySyncItems=missionState.currentOps?.missions||[]
 const plannedSorties=useMemo(()=>{
  const incidentNames=(missionState.incidents||[]).map(item=>item.name)
  const source=missionState.currentOps?.missions||[]
  return source.slice(0,12).map((mission,index)=>{
   const primaryIncident=mission.fire||mission.incident||mission.area||incidentNames[index%Math.max(1,incidentNames.length)]||'Regional'
   const incidentCode=(primaryIncident.split(/\s+/).filter(Boolean).map(word=>word[0]).join('').toUpperCase()||'INC').slice(0,4)
   const callsign=mission.callsign||(/MQ-9/i.test(mission.platform||'')?'GARGOYLE':/UH-72/i.test(mission.platform||'')?'BEAR':/CAP/i.test(mission.platform||'')?'CAP':mission.platform||'ASSET')
   const sequence=String(index+1).padStart(2,'0')
   const windowParts=String(mission.window||'').match(/\d{4}/g)||[]
   const start=windowParts[0]?Number(windowParts[0].slice(0,2)):9
   const end=windowParts[1]?Number(windowParts[1].slice(0,2)):12
   return {
    id:mission.id,
    label:`${incidentCode}-${String(callsign).replace(/[^A-Z0-9]/gi,'').toUpperCase()}-${sequence}`,
    primaryIncident,
    asset:callsign,
    assetType:mission.platform||callsign,
    callsign,
    start,
    end,
    capability:mission.capability||mission.product||mission.objective||'EO/IR',
    window:mission.window||`${String(start).padStart(2,'0')}00L–${String(end).padStart(2,'0')}00L`,
   }
  })
 },[missionState.currentOps?.missions,missionState.incidents])

 const [selectedRequirementId,setSelectedRequirementId]=useState(requirements[0]?.id)
 const selectedRequirement=requirements.find(requirement=>requirement.id===selectedRequirementId)||requirements[0]||{}
 const [requirementsHeight,setRequirementsHeight]=useStoredSize('nexus-rs-cm-requirements-height-v1',430,320,760)
 const [middleHeight,setMiddleHeight]=useStoredSize('nexus-rs-cm-taskability-deck-height-v1',300,220,680)
 const [deckItems,setDeckItems]=useState(()=>{
  try{
   const saved=JSON.parse(localStorage.getItem('nexus-rs-collection-deck-draft')||'null')
   if(Array.isArray(saved)&&saved.length) return saved
  }catch{}
  return requirements.slice(0,3).map((requirement,index)=>({
   ...requirement,
   status:index===1?'draft':'ready',
   assignedSortieId:index<2?plannedSorties[index]?.id:'',
   assignedSortieLabel:index<2?plannedSorties[index]?.label:'',
   assignedSortieAsset:index<2?plannedSorties[index]?.asset:'',
   assignedSortieStart:index<2?plannedSorties[index]?.start:undefined,
   assignedSortieEnd:index<2?plannedSorties[index]?.end:undefined,
   assignedSortieCapability:index<2?plannedSorties[index]?.capability:'',
   deckSequence:index+1,
  }))
 })
 const [showDeckOutput,setShowDeckOutput]=useState(false)
 const [showAllSorties,setShowAllSorties]=useState(false)
 const [openSortieId,setOpenSortieId]=useState('')

 useEffect(()=>{
  localStorage.setItem('nexus-rs-collection-deck-draft',JSON.stringify(deckItems))
 },[deckItems])

 const addToDeck=(requirement)=>{
  setDeckItems(current=>{
   const exists=current.some(item=>item.id===requirement.id)
   return exists
    ?current.map(item=>item.id===requirement.id?{...item,...requirement}:item)
    :[...current,{...requirement,assignedSortieId:'',deckSequence:1}]
  })
  onSendRequirementForward?.(requirement.id)
 }

 const assignSortie=(requirementId,sortieId)=>{
  const sortie=plannedSorties.find(candidate=>candidate.id===sortieId)
  setDeckItems(current=>{
   const next=current.map(item=>item.id===requirementId?{
    ...item,
    assignedSortieId:sortieId,
    assignedSortieLabel:sortie?.label||'',
    assignedSortieAsset:sortie?.asset||'',
    assignedSortieStart:sortie?.start,
    assignedSortieEnd:sortie?.end,
    assignedSortieCapability:sortie?.capability||'',
   }:item)
   const assigned=next.filter(item=>item.assignedSortieId===sortieId)
   return next.map(item=>{
    if(item.assignedSortieId!==sortieId) return item
    const existingIndex=assigned.findIndex(candidate=>candidate.id===item.id)
    return {...item,deckSequence:existingIndex+1}
   })
  })
 }

 const assignRequirementToSortie=(requirement,sortieId)=>{
  const sortie=plannedSorties.find(candidate=>candidate.id===sortieId)
  setDeckItems(current=>{
   const existing=current.find(item=>item.id===requirement.id)
   const base=existing?{...existing,...requirement}:{...requirement,status:'ready'}
   const updated={
    ...base,
    assignedSortieId:sortieId,
    assignedSortieLabel:sortie?.label||'',
    assignedSortieAsset:sortie?.asset||'',
    assignedSortieStart:sortie?.start,
    assignedSortieEnd:sortie?.end,
    assignedSortieCapability:sortie?.capability||'',
   }
   const without=current.filter(item=>item.id!==requirement.id)
   const next=[...without,updated]
   const assigned=next.filter(item=>item.assignedSortieId===sortieId)
   return next.map(item=>{
    if(item.assignedSortieId!==sortieId) return item
    const index=assigned.findIndex(candidate=>candidate.id===item.id)
    return {...item,deckSequence:index+1}
   })
  })
  onSendRequirementForward?.(requirement.id)
 }

 const moveDeckItem=(sortieId,draggedId,targetId)=>{
  setDeckItems(current=>{
   const sortieItems=current.filter(item=>item.assignedSortieId===sortieId).sort((a,b)=>(a.deckSequence||999)-(b.deckSequence||999))
   const from=sortieItems.findIndex(item=>item.id===draggedId)
   const to=sortieItems.findIndex(item=>item.id===targetId)
   if(from<0||to<0) return current
   const reordered=[...sortieItems]
   const [moved]=reordered.splice(from,1)
   reordered.splice(to,0,moved)
   const sequenceById=Object.fromEntries(reordered.map((item,index)=>[item.id,index+1]))
   return current.map(item=>item.assignedSortieId===sortieId?{...item,deckSequence:sequenceById[item.id]}:item)
  })
 }

 const openSortie=plannedSorties.find(sortie=>sortie.id===openSortieId)
 const openSortieItems=deckItems.filter(item=>item.assignedSortieId===openSortieId)

 return <div className="rx-role-layout collection rx-collection-ppt-layout">
  <style>{`
   .rx-collection-ppt-layout{display:grid;gap:10px;min-height:calc(100vh - 96px);font-size:12px}
   .rx-collection-ppt-layout .rx-panel-title,.rx-collection-ppt-layout h4{font-size:12px}
   .rx-collection-ppt-layout p,.rx-collection-ppt-layout li,.rx-collection-ppt-layout td,.rx-collection-ppt-layout dd{font-size:11px}
   .rx-collection-ppt-layout label,.rx-collection-ppt-layout dt{font-size:10px}
   .rx-collection-ppt-layout input,.rx-collection-ppt-layout select,.rx-collection-ppt-layout textarea,.rx-collection-ppt-layout button{font-size:11px}
   .rx-collection-requirements-row{min-height:430px}
   .rx-collection-requirements-row>.rx-panel{height:100%}
   .rx-collection-ppt-layout .rx-requirement-workspace{height:100%;display:flex;flex-direction:column}
   .rx-cm-requirement-stages{flex:1;min-height:380px}
   .rx-cm-requirement-stages>.rx-cm-stage{min-width:0;padding:11px;overflow:auto;background:rgba(4,18,29,.28)}
   .rx-cm-stage h4{margin:0 0 3px;color:#5ce2ec}
   .rx-cm-stage-help{margin:0 0 10px;color:#8da5b2}
   .rx-cm-incoming-list{display:flex;flex-direction:column;gap:6px}
   .rx-cm-customer-form,.rx-cm-refined-form{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
   .rx-cm-requirement-stages .rx-form-grid input,.rx-cm-requirement-stages .rx-form-grid select{height:32px}
   .rx-cm-requirement-stages .rx-form-grid textarea{min-height:64px}
   .rx-middle-work-row{min-height:220px}
   .rx-cm-height-handle{height:7px;cursor:row-resize;border-top:1px solid #17435a;border-bottom:1px solid #17435a;background:rgba(12,43,58,.55)}
   .rx-cm-height-handle:hover{background:rgba(35,104,126,.6)}
   .rx-taskability-options{height:100%;display:flex;flex-direction:column}
   .rx-taskability-selected{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-bottom:1px solid rgba(127,232,244,.14)}
   .rx-taskability-selected>div{padding:9px 10px;border-right:1px solid rgba(127,232,244,.12)}
   .rx-taskability-selected>div:last-child{border-right:0}
   .rx-taskability-selected span{display:block;color:#819ba9;font-size:9px}
   .rx-taskability-selected strong{display:block;margin-top:3px;color:#e5f0f4;font-size:11px}
   .rx-taskability-selected .task strong{font-size:15px}
   .rx-taskability-selected small{display:block;margin-top:3px;color:#8fa8b5;font-size:9px;text-transform:uppercase}
   .rx-taskability-selected small.warning{color:#ffbd54}
   .rx-taskability-options-title{display:flex;justify-content:space-between;align-items:center;padding:8px 10px 0}
   .rx-taskability-options-title strong{color:#dce9ee;font-size:10px}
   .rx-taskability-options-title button{height:28px;border:1px solid #2ebdca;background:#0b3443;color:#7fe8f4;padding:0 10px;cursor:pointer}
   .rx-taskability-options-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:9px;overflow:auto}
   .rx-taskability-option{display:flex;flex-direction:column;min-width:0;padding:9px;border:1px solid #21485c;background:rgba(5,22,35,.72)}
   .rx-taskability-option.assigned{border-color:#36d4cb;box-shadow:inset 0 0 0 1px rgba(54,212,203,.25)}
   .rx-taskability-option header{display:flex;justify-content:space-between;gap:8px}
   .rx-taskability-option header strong,.rx-taskability-option header span{display:block}
   .rx-taskability-option header strong{color:#e6f1f5;font-size:11px}
   .rx-taskability-option header span{margin-top:3px;color:#8ea4b0;font-size:9px}
   .rx-taskability-option header em{align-self:flex-start;font-style:normal;font-size:8px;padding:3px 5px;border-radius:3px}
   .rx-taskability-option dl{display:grid;grid-template-columns:repeat(3,1fr);margin:9px 0 0}
   .rx-taskability-option dl div{padding:6px;border:1px solid rgba(127,232,244,.1)}
   .rx-taskability-option dt{color:#7893a1;font-size:8px}
   .rx-taskability-option dd{margin:3px 0 0;color:#d5e3e9;font-size:9px}
   .rx-taskability-option ul{margin:8px 0;padding-left:16px;color:#ffc15a;font-size:9px}
   .rx-taskability-option button{margin-top:auto;height:31px;border:1px solid #2ebdca;background:#0b3443;color:#7fe8f4;cursor:pointer}
   .rx-taskability-option button:disabled{opacity:.35;cursor:not-allowed}
   .rx-middle-work-row>.rx-panel{height:100%;display:flex;flex-direction:column}
   .rx-middle-work-row .rx-outline-button{margin-top:auto}
   .rx-active-deck{height:100%;display:flex;flex-direction:column}
   .rx-active-deck>.rx-outline-button{margin-top:auto}
   .rx-active-deck-meta{display:flex;gap:18px;padding:9px 11px;border-bottom:1px solid rgba(127,232,244,.15);color:#9eb2bf}
   .rx-active-deck-meta b{color:#7fe8f4;font-size:16px;margin-right:4px}
   .rx-deck-assignment-table .head,.rx-deck-assignment-table .row{display:grid;grid-template-columns:78px 48px 1.35fr 66px minmax(145px,1.2fr) 84px;gap:8px;align-items:center}
   .rx-deck-assignment-table .head{padding:8px 9px;color:#8ba3af;font-size:9px;border-bottom:1px solid rgba(127,232,244,.18)}
   .rx-deck-assignment-table .row{padding:8px 9px;border-bottom:1px solid rgba(127,232,244,.12)}
   .rx-deck-assignment-table select{height:30px;background:#071827;color:#e7f2f6;border:1px solid #28536a}
   .rx-deck-assignment-table button{height:29px;border:1px solid #2ebdca;background:#0b3443;color:#7fe8f4;cursor:pointer}
   .rx-deck-assignment-table button:disabled{opacity:.35;cursor:not-allowed}
   .rx-collection-sync-row-layout{min-height:260px}
   .rx-collection-sync-row-layout>.rx-panel{height:100%;display:flex;flex-direction:column}
   .rx-collection-sync-preview>.rx-outline-button{margin-top:auto}
   .rx-collection-sync-subtitle{padding:8px 10px;border-bottom:1px solid rgba(127,232,244,.15);color:#8ea6b3}
   .rx-collection-sync-hours{display:grid;grid-template-columns:repeat(3,1fr);padding:6px 9px 6px 115px;border-bottom:1px solid rgba(127,232,244,.12);color:#7895a4}
   .rx-collection-sync-hours span:nth-child(2){text-align:center}.rx-collection-sync-hours span:last-child{text-align:right}
   .rx-collection-sync-body{position:relative;padding:5px 8px}
   .rx-sync-now-line{position:absolute;top:0;bottom:0;z-index:4;border-left:1px dashed rgba(255,196,84,.9);pointer-events:none}
   .rx-sync-now-line span{position:absolute;top:1px;left:4px;color:#ffc454;font-size:7px;background:#071827;padding:1px 3px}
   .rx-collection-sync-row{display:grid;grid-template-columns:98px minmax(0,1fr) 76px;gap:8px;align-items:center;min-height:35px;border-bottom:1px solid rgba(127,232,244,.1)}
   .rx-collection-sync-row>strong{font-size:10px;color:#d8e7ec;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
   .rx-collection-sync-row>em{font-style:normal;font-size:9px;text-align:right;color:#8fa6b2}
   .rx-collection-sync-track{position:relative;height:22px;background:repeating-linear-gradient(90deg,rgba(30,75,94,.35) 0,rgba(30,75,94,.35) 1px,transparent 1px,transparent 12.5%);border:1px solid rgba(35,81,99,.55)}
   .rx-collection-sync-block{position:absolute;top:2px;height:16px;min-width:48px;border:1px solid #28bbc6;background:#0a6871;border-radius:2px;overflow:hidden;padding:1px 4px;color:#edffff}
   .rx-collection-sync-block.draft{border-style:dashed;border-color:#62a9ef;background:#1c4f7d}
   .rx-collection-sync-block b{display:block;font-size:7px;line-height:7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
   .rx-collection-sync-block small{display:block;font-size:6px;line-height:7px;color:#c0d3dc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
   .rx-collection-map-row{min-height:360px}
   .rx-collection-map-full{display:block}
   .rx-collection-map-full>.rx-panel{width:100%;height:100%}
   .rx-collection-map-row>.rx-panel{height:100%}
   .rx-collection-support-stack{display:grid;grid-template-rows:minmax(135px,.8fr) 5px minmax(145px,1fr);min-height:0}
   .rx-collection-support-stack>.rx-panel{min-height:0;display:flex;flex-direction:column}
   .rx-collection-support-stack .rx-outline-button{margin-top:auto}
   .rx-support-divider{cursor:row-resize;border-top:1px solid #17435a;border-bottom:1px solid #17435a}
   .rx-sortie-deck-modal,.rx-deck-modal{position:fixed;inset:0;z-index:9999;background:rgba(0,8,15,.9);display:flex;align-items:center;justify-content:center;padding:24px}
   .rx-sortie-deck-card,.rx-deck-modal-card{width:min(96vw,1700px);height:min(92vh,940px);background:#071827;border:1px solid #2a7189;display:flex;flex-direction:column;box-shadow:0 25px 80px #000}
   .rx-sortie-deck-card>header,.rx-deck-modal-card>header{display:flex;justify-content:space-between;align-items:flex-start;padding:16px 18px;border-bottom:1px solid #21485b}
   .rx-sortie-deck-card header span{color:#63e1ee;font-size:10px;letter-spacing:.12em}
   .rx-sortie-deck-card h2{margin:3px 0;color:#f2f7fa;font-size:22px}
   .rx-sortie-deck-card p{margin:0;color:#91a9b6}
   .rx-sortie-deck-card button{border:1px solid #3fbfd2;background:#0a2736;color:#8deaf3;padding:8px 12px;cursor:pointer}
   .rx-sortie-deck-route{display:flex;gap:8px;align-items:center;padding:13px 16px;overflow:auto;border-bottom:1px solid #21485b}
   .rx-sortie-deck-route div{display:flex;align-items:center;gap:6px;min-width:max-content}
   .rx-sortie-deck-route div:not(:last-child):after{content:'→';color:#4fcfdb;margin-left:8px}
   .rx-sortie-deck-route b{display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:#0c6571;color:white}
   .rx-sortie-deck-table{overflow:auto;flex:1}
   .rx-sortie-deck-table .head,.rx-sortie-deck-table .row{display:grid;grid-template-columns:90px 42px 48px 1.1fr 1.6fr 2fr 72px 180px;gap:8px;align-items:center;padding:9px 12px;border-bottom:1px solid #1d3b4c}
   .rx-sortie-deck-table .head{position:sticky;top:0;background:#102838;color:#7fe8f4;font-size:9px;z-index:2}
   .rx-sortie-deck-table .row{cursor:grab}
   .rx-sortie-deck-table .actions{display:flex;gap:5px}
   .rx-sortie-deck-table .actions button{padding:5px 7px;font-size:9px}
   .rx-sortie-deck-card>footer{display:flex;justify-content:space-between;gap:20px;align-items:center;padding:12px 16px;border-top:1px solid #21485b}
   .rx-sortie-deck-card>footer>div{display:flex;gap:10px;flex-wrap:wrap;color:#9cb0bb}
   .rx-sortie-deck-card>footer>div strong,.rx-sortie-deck-card>footer>div span:not(:only-child){color:#ffc454}

   .rx-sortie-picker-modal{position:fixed;inset:0;z-index:10000;background:rgba(0,8,15,.9);display:flex;align-items:center;justify-content:center;padding:24px}
   .rx-sortie-picker-card{width:min(95vw,1450px);height:min(88vh,860px);background:#071827;border:1px solid #2a7189;display:flex;flex-direction:column;box-shadow:0 25px 80px #000}
   .rx-sortie-picker-card>header{display:flex;justify-content:space-between;align-items:flex-start;padding:16px 18px;border-bottom:1px solid #21485b}
   .rx-sortie-picker-card header span{color:#63e1ee;font-size:10px;letter-spacing:.12em}
   .rx-sortie-picker-card h2{margin:3px 0;color:#f2f7fa;font-size:22px}
   .rx-sortie-picker-card p{margin:0;color:#91a9b6}
   .rx-sortie-picker-card button{border:1px solid #3fbfd2;background:#0a2736;color:#8deaf3;padding:8px 12px;cursor:pointer}
   .rx-sortie-picker-table{overflow:auto;flex:1}
   .rx-sortie-picker-table .head,.rx-sortie-picker-table .row{display:grid;grid-template-columns:130px 150px 110px 120px 1fr 120px 95px;gap:8px;align-items:center;padding:10px 12px;border-bottom:1px solid #1d3b4c}
   .rx-sortie-picker-table .head{position:sticky;top:0;background:#102838;color:#7fe8f4;font-size:9px}
   @media(max-width:1200px){.rx-cm-requirement-stages{grid-template-columns:1fr!important}.rx-collection-map-row{grid-template-columns:1fr!important}}
  `}</style>

  <div className="rx-collection-requirements-row" style={{height:requirementsHeight}}>
   <RequirementDevelopment
    missionState={missionState}
    onUpdateRequirement={onUpdateRequirement}
    onValidateRequirement={onValidateRequirement}
    onAddToDeck={addToDeck}
    selectedRequirementId={selectedRequirementId}
    onSelectRequirement={setSelectedRequirementId}
   />
  </div>
  <DragHandle className="horizontal rx-cm-height-handle" onDrag={delta=>setRequirementsHeight(value=>clamp(value+delta.dy,320,760))}/>

  <ResizableRow storageKey="nexus-rs-collection-middle-work-v4" initial={[50,50]} min={28} className="rx-middle-work-row" style={{height:middleHeight}}>
   <Taskability
    selectedRequirement={selectedRequirement}
    deckItems={deckItems}
    sorties={plannedSorties}
    onAssignRequirement={assignRequirementToSortie}
    onViewAllSorties={()=>setShowAllSorties(true)}
    currentTime={missionState.exercise?.localIncidentTime||missionState.asOf||'1732L'}
   />
   <ActiveCollectionDeck
    items={deckItems}
    sorties={plannedSorties}
    onAssignSortie={assignSortie}
    onOpenDeck={setOpenSortieId}
    onOpenOutput={()=>setShowDeckOutput(true)}
   />
  </ResizableRow>
  <DragHandle className="horizontal rx-cm-height-handle" onDrag={delta=>setMiddleHeight(value=>clamp(value+delta.dy,220,680))}/>

  <ResizableRow storageKey="nexus-rs-collection-sync-previews-v2" initial={[50,50]} min={28} className="rx-collection-sync-row-layout">
   <CollectionSyncPreview title="SYNC MATRIX — TODAY'S PLAN" subtitle="Approved / executing collection picture" items={todaySyncItems} currentTime={missionState.exercise?.localIncidentTime||missionState.asOf||'1732L'} onOpen={()=>onNavigate?.('sync')}/>
   <CollectionSyncPreview title="SYNC MATRIX — TOMORROW'S PLAN (DRAFT)" subtitle="Updates from sortie assignment and deck sequence" items={deckItems} sorties={plannedSorties} draft onOpen={()=>onNavigate?.('sync')}/>
  </ResizableRow>

  <div className="rx-collection-map-row rx-collection-map-full">
   <RegionalMissionPicture role={role} missionState={missionState}/>
  </div>

  {showDeckOutput&&<CollectionDeckOutput items={deckItems} onClose={()=>setShowDeckOutput(false)}/>}
  {showAllSorties&&<AllSortiesModal requirement={selectedRequirement} deckItems={deckItems} sorties={plannedSorties} onAssign={assignRequirementToSortie} onClose={()=>setShowAllSorties(false)}/>}
  {openSortie&&<SortieDeckEditor sortie={openSortie} items={openSortieItems} onClose={()=>setOpenSortieId('')} onMove={moveDeckItem}/>}
 </div>
}

function UPADView(props){
 const {onNavigate}=props
 const [selectedId,setSelectedId]=React.useState('EP-CAP-03')
 const [openId,setOpenId]=React.useState('')
 const [sortieUPAD,setSortieUPAD]=React.useState({'PR-GARGOYLE-01':'U1','EP-CAP-03':'U2','BC-SAT-02':'U4','BC-GARGOYLE-02':'U3'})
 const [exceptions,setExceptions]=React.useState({'EP-041':'U4'})
 const [shifts,setShifts]=React.useState({U1:'0600–1400L',U2:'1000–1800L',U3:'1400–2200L',U4:'1800–0200L'})
 const [support,setSupport]=React.useState({bandwidth:'OPEN',exploit:'OPEN',staffing:'IN REVIEW'})

 const upads=[
  {id:'U1',name:'UPAD 1 · NORTH',skills:['IMAGERY','FMV'],load:86,state:'AT RISK'},
  {id:'U2',name:'UPAD 2 · CENTRAL',skills:['IMAGERY','GIS'],load:92,state:'OVER CAPACITY'},
  {id:'U3',name:'UPAD 3 · SOUTH',skills:['FMV','ALL SOURCE'],load:61,state:'ACTIVE'},
  {id:'U4',name:'UPAD 4 · RESERVE',skills:['GIS','SATELLITE','PUBLIC INFO','ALL SOURCE'],load:22,state:'RESERVE'},
 ]
 const decks=[
  {id:'PR-GARGOYLE-01',incident:'Pine Ridge',source:'GARGOYLE · MQ-9',taskCount:48,productCount:12,types:['FMV','STILL IMAGERY'],skills:['FMV','IMAGERY'],delivery:'1800–2130L',products:{'IMAGERY ASSESSMENTS':7,'FMV SUMMARIES':4,'GIS LAYERS':1},tasks:[
   {id:'PR-018',title:'Late-Period Fire Perimeter',type:'IMAGERY',product:'CHANGE DETECTION',need:'Determine whether evacuation trigger points should expand east.',eeis:'Perimeter · Spot fires · Threatened structures'},
   {id:'PR-024',title:'Fire Behavior FMV Review',type:'FMV',product:'FMV ASSESSMENT',need:'Characterize north and east flank fire behavior.',eeis:'Spread · Spotting · Flame intensity'},
   {id:'PR-031',title:'Operations Map Update',type:'GIS',product:'GIS MAP LAYER',need:'Update the current fire perimeter layer.',eeis:'Perimeter geometry · Control lines · Heat areas'}]},
  {id:'EP-CAP-03',incident:'Eagle Peak',source:'CAP · STILL IMAGERY',taskCount:56,productCount:8,types:['STILL IMAGERY'],skills:['IMAGERY'],delivery:'1730–2200L',products:{'IMAGERY ASSESSMENTS':5,'GIS LAYERS':2,'PUBLIC INFO':1},tasks:[
   {id:'EP-033',title:'Structure Damage Assessment',type:'IMAGERY',product:'DAMAGE ASSESSMENT',need:'Identify damaged structures and infrastructure.',eeis:'Structures · Access · Infrastructure'},
   {id:'EP-037',title:'Community Impact Imagery',type:'IMAGERY',product:'IMAGERY ASSESSMENT',need:'Assess visible community impacts.',eeis:'Structure impacts · Smoke · Access'},
   {id:'EP-041',title:'Flood Extent Map Layer',type:'GIS',product:'GIS MAP LAYER',need:'Build a GIS layer showing flood extent.',eeis:'Water boundary · Inundated roads · Structures'},
   {id:'EP-044',title:'Public Information Map',type:'GIS / PUBLIC INFO',product:'PUBLIC INFO PRODUCT',need:'Create a releasable community impact map.',eeis:'Major impacts · Closures · Overview'}]},
  {id:'BC-SAT-02',incident:'Bear Creek',source:'SATELLITE COLLECTION',taskCount:14,productCount:4,types:['SATELLITE'],skills:['SATELLITE','GIS'],delivery:'1900–2300L',products:{'SATELLITE ASSESSMENTS':2,'GIS LAYERS':2},tasks:[
   {id:'BC-022',title:'East Flank Change Detection',type:'SATELLITE',product:'CHANGE DETECTION',need:'Determine whether fire crossed Bear Creek Ridge.',eeis:'Perimeter change · Structures · Fire behavior'},
   {id:'BC-027',title:'Road Access Assessment',type:'GIS',product:'GIS MAP LAYER',need:'Determine which emergency routes remain usable.',eeis:'Closures · Bridge damage · Obstructions'}]},
  {id:'BC-GARGOYLE-02',incident:'Bear Creek',source:'GARGOYLE · MQ-9',taskCount:39,productCount:10,types:['FMV','STILL IMAGERY'],skills:['FMV','IMAGERY'],delivery:'1830–2330L',products:{'FMV SUMMARIES':6,'IMAGERY ASSESSMENTS':4},tasks:[
   {id:'BC-035',title:'South Flank FMV Review',type:'FMV',product:'FMV ASSESSMENT',need:'Track south flank movement.',eeis:'Spread · Spotting · Suppression'},
   {id:'BC-039',title:'Critical Infrastructure Check',type:'IMAGERY',product:'IMAGERY ASSESSMENT',need:'Assess infrastructure exposure.',eeis:'Power · Water · Access'}]},
 ]
 const selected=decks.find(d=>d.id===selectedId)||decks[0]
 const openDeck=decks.find(d=>d.id===openId)
 const upad=id=>upads.find(u=>u.id===id)
 const primary=d=>sortieUPAD[d.id]||''
 const exceptionCount=d=>d.tasks.filter(t=>exceptions[t.id]&&exceptions[t.id]!==primary(d)).length
 const recommendations=d=>[...upads].map(u=>({...u,match:d.skills.filter(s=>u.skills.includes(s)).length})).sort((a,b)=>(b.match*50-b.load)-(a.match*50-a.load))

 return <div className="rx-role-layout upad rx-upad-sortie">
  <style>{`
   .rx-upad-sortie{font-size:12px}.rx-us-top{display:grid;grid-template-columns:1fr 1.15fr;gap:10px;min-height:420px}.rx-us-list{padding:7px 10px;overflow:auto}
   .rx-us-deck{width:100%;display:grid;grid-template-columns:145px 1fr 145px 95px;gap:8px;align-items:center;text-align:left;border:0;border-bottom:1px solid #1c3c4d;background:transparent;color:#d9e6eb;padding:12px 7px;cursor:pointer}.rx-us-deck.active{background:#153f58;border-left:3px solid #42d9e8}.rx-us-deck strong,.rx-us-deck b{display:block}.rx-us-deck small{display:block;color:#8fa7b3;margin-top:3px}.rx-us-deck em{font-style:normal;color:#ffbd54;font-size:9px}
   .rx-us-work{padding:12px}.rx-us-head{display:flex;justify-content:space-between;border-bottom:1px solid #255064;padding-bottom:10px}.rx-us-head h2{margin:3px 0;font-size:21px}.rx-us-head span,.rx-us-label{color:#62dfed;font-size:9px}.rx-us-head em{color:#ffbd54;font-style:normal}
   .rx-us-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin:10px 0}.rx-us-summary div{border:1px solid #24495b;background:#0a2130;padding:8px}.rx-us-summary span{display:block;color:#8fa7b3;font-size:8px}.rx-us-summary strong{display:block;margin-top:4px}
   .rx-us-mix{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:8px 0}.rx-us-mix div{border-bottom:1px solid #285063;padding:6px}.rx-us-mix b{font-size:16px}.rx-us-mix span{display:block;color:#8fa7b3;font-size:8px}
   .rx-us-rec{display:grid;grid-template-columns:1.2fr 1fr 75px 110px;gap:8px;align-items:center;border-top:1px solid #244354;padding:8px 0}.rx-us-rec small{display:block;color:#8ea5b0}.rx-us-rec button,.rx-us-actions button{border:1px solid #38bfd0;background:#0c3342;color:#83eaf3;padding:6px 8px;cursor:pointer}.rx-us-actions{display:flex;gap:7px;margin-top:9px}
   .rx-us-board{margin-top:10px}.rx-us-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:10px}.rx-us-card{border:1px solid #2b5366;background:#0a2130;padding:10px}.rx-us-card header{display:flex;justify-content:space-between}.rx-us-card h3{margin:0;font-size:12px}.rx-us-card em{color:#ffbd54;font-style:normal;font-size:9px}.rx-us-skills{display:flex;gap:4px;flex-wrap:wrap;margin:8px 0}.rx-us-skills span{font-size:8px;border:1px solid #376172;padding:3px 5px}.rx-us-load{height:7px;background:#183443}.rx-us-load i{display:block;height:100%;background:#39bac8}.rx-us-card dl div{display:flex;justify-content:space-between;border-top:1px solid #203f50;padding:5px 0}.rx-us-card dd{margin:0}.rx-us-card select{width:100%;background:#071b29;border:1px solid #31596b;color:#dce9ed;padding:5px}
   .rx-us-bottom{display:grid;grid-template-columns:1.4fr .8fr;gap:10px;margin-top:10px}.rx-us-table .head,.rx-us-table .row{display:grid;grid-template-columns:135px 75px 85px 1fr 85px 65px;gap:8px;align-items:center;padding:9px 10px;border-bottom:1px solid #1f4051}.rx-us-table .head{color:#79dfea;font-size:9px}.rx-us-table button{border:1px solid #327d91;background:#0a2b39;color:#7ee5ef;padding:5px}
   .rx-us-support{padding:8px 10px}.rx-us-support .row{display:grid;grid-template-columns:1fr 45px 95px;gap:8px;align-items:center;border-bottom:1px solid #234657;padding:10px 0}.rx-us-support select{background:#071b29;border:1px solid #31596b;color:#dce9ed;padding:5px}
   .rx-us-modal{position:fixed;inset:0;z-index:10000;background:rgba(0,8,15,.92);display:flex;align-items:center;justify-content:center;padding:22px}.rx-us-modal-card{width:min(96vw,1500px);height:min(90vh,900px);background:#071827;border:1px solid #2a7189;display:flex;flex-direction:column}.rx-us-modal-card>header{display:flex;justify-content:space-between;padding:15px 18px;border-bottom:1px solid #21485b}.rx-us-modal-card h2{margin:3px 0}.rx-us-modal-card header button{border:1px solid #3fbfd2;background:#0a2736;color:#8deaf3;padding:8px 12px}.rx-us-note{padding:10px 15px;background:#102d3e;color:#b9d0d9}.rx-us-note strong{color:#7fe8f4}
   .rx-us-exceptions{overflow:auto;flex:1}.rx-us-exceptions .head,.rx-us-exceptions .row{display:grid;grid-template-columns:80px 1.2fr 95px 1fr 1.2fr 160px;gap:8px;align-items:center;padding:10px 12px;border-bottom:1px solid #1d3b4c}.rx-us-exceptions .head{position:sticky;top:0;background:#102838;color:#7fe8f4;font-size:9px}.rx-us-exceptions small{display:block;color:#8ea5b0}.rx-us-exceptions select{background:#071b29;border:1px solid #31596b;color:#dce9ed;padding:6px}
   @media(max-width:1200px){.rx-us-top,.rx-us-bottom{grid-template-columns:1fr}.rx-us-cards{grid-template-columns:repeat(2,1fr)}}
  `}</style>
  <div className="rx-us-top">
   <Panel title="INCOMING COLLECTION DECKS"><div className="rx-us-list">{decks.map(d=><button key={d.id} className={`rx-us-deck ${selected.id===d.id?'active':''}`} onClick={()=>setSelectedId(d.id)}><span><strong>{d.id}</strong><small>{d.incident} · {d.source}</small></span><span><b>{d.taskCount} TASKINGS / {d.productCount} EXPECTED PRODUCTS</b><small>{d.types.join(' + ')}</small></span><span><b>{upad(primary(d))?.name||'UNASSIGNED'}</b><small>{exceptionCount(d)?`${exceptionCount(d)} TASK EXCEPTIONS`:'WHOLE SORTIE ASSIGNMENT'}</small></span><em>{d.delivery}</em></button>)}</div></Panel>
   <Panel title="SORTIE ASSIGNMENT WORKSPACE"><div className="rx-us-work">
    <div className="rx-us-head"><div><span>ACTIVE COLLECTION DECK</span><h2>{selected.id}</h2><small>{selected.incident} · {selected.source}</small></div><div><span>DELIVERY WINDOW</span><h2>{selected.delivery}</h2><em>{selected.taskCount} TASKINGS</em></div></div>
    <div className="rx-us-summary"><div><span>TASKINGS</span><strong>{selected.taskCount}</strong></div><div><span>EXPECTED PRODUCTS</span><strong>{selected.productCount}</strong></div><div><span>COLLECTION TYPE</span><strong>{selected.types.join(' + ')}</strong></div><div><span>SPECIALTIES</span><strong>{selected.skills.join(' + ')}</strong></div></div>
    <span className="rx-us-label">EXPECTED PRODUCT MIX</span><div className="rx-us-mix">{Object.entries(selected.products).map(([k,v])=><div key={k}><b>{v}</b><span>{k}</span></div>)}</div>
    <span className="rx-us-label">RECOMMENDED UPADS — ASSIGN THE WHOLE SORTIE BY DEFAULT</span>{recommendations(selected).slice(0,3).map(u=><div className="rx-us-rec" key={u.id}><strong>{u.name}<small>{u.skills.join(' · ')}</small></strong><span>{u.match}/{selected.skills.length} SPECIALTY MATCH</span><span>{u.load}% LOAD</span><button onClick={()=>setSortieUPAD(c=>({...c,[selected.id]:u.id}))}>{primary(selected)===u.id?'ASSIGNED':'ASSIGN SORTIE'}</button></div>)}
    <div className="rx-us-actions"><button onClick={()=>setOpenId(selected.id)}>OPEN DECK / MANAGE EXCEPTIONS</button><button onClick={()=>setExceptions(c=>Object.fromEntries(Object.entries(c).filter(([id])=>!selected.tasks.some(t=>t.id===id))))}>CLEAR TASK EXCEPTIONS</button></div>
   </div></Panel>
  </div>
  <Panel title="UPAD MANNING, SPECIALTY & SHIFT BOARD" className="rx-us-board"><div className="rx-us-cards">{upads.map(u=>{const ds=decks.filter(d=>primary(d)===u.id);const ex=Object.values(exceptions).filter(id=>id===u.id).length;return <article className="rx-us-card" key={u.id}><header><h3>{u.name}</h3><em>{u.state}</em></header><div className="rx-us-skills">{u.skills.map(x=><span key={x}>{x}</span>)}</div><div className="rx-us-load"><i style={{width:`${u.load}%`}}/></div><dl><div><dt>Workload</dt><dd>{u.load}%</dd></div><div><dt>Sorties Assigned</dt><dd>{ds.length}</dd></div><div><dt>Task Exceptions</dt><dd>{ex}</dd></div></dl><select value={shifts[u.id]} onChange={ev=>setShifts(c=>({...c,[u.id]:ev.target.value}))}><option>0600–1400L</option><option>1000–1800L</option><option>1400–2200L</option><option>1800–0200L</option><option>OFF SHIFT</option></select></article>})}</div></Panel>
  <div className="rx-us-bottom">
   <Panel title="ACTIVE SORTIE / PRODUCT BOARD"><div className="rx-us-table"><div className="head"><span>SORTIE</span><span>TASKINGS</span><span>PRODUCTS</span><span>PRODUCT MIX</span><span>PRIMARY UPAD</span><span>ACTION</span></div>{decks.map(d=><div className="row" key={d.id}><strong>{d.id}</strong><span>{d.taskCount}</span><span>{d.productCount}</span><span>{Object.keys(d.products).join(' · ')}</span><span>{primary(d)||'—'}</span><button onClick={()=>{setSelectedId(d.id);setOpenId(d.id)}}>OPEN</button></div>)}</div></Panel>
   <Panel title="UPAD SUPPORT REQUESTS" accent="purple"><div className="rx-us-support">{[['bandwidth','Additional Bandwidth','U1'],['exploit','Extra Exploitation Support','U2'],['staffing','Additional Imagery Analyst','U2']].map(([id,label,from])=><div className="row" key={id}><strong>{label}</strong><span>{from}</span><select value={support[id]} onChange={ev=>setSupport(c=>({...c,[id]:ev.target.value}))}><option>OPEN</option><option>IN REVIEW</option><option>FLOW TO RS COORD</option><option>RESOLVED</option></select></div>)}</div><Button onClick={()=>onNavigate?.('mission')}>FLOW UNMET NEEDS TO RS COORD</Button></Panel>
  </div>
  {openDeck&&<div className="rx-us-modal"><div className="rx-us-modal-card"><header><div><span>COLLECTION DECK / TASK EXCEPTION MANAGER</span><h2>{openDeck.id}</h2><p>{openDeck.taskCount} taskings · {openDeck.productCount} expected products · Primary: {upad(primary(openDeck))?.name||'UNASSIGNED'}</p></div><button onClick={()=>setOpenId('')}>CLOSE</button></header><div className="rx-us-note"><strong>DEFAULT:</strong> Every Task ID inherits the sortie's primary UPAD. Reassign only specialty or capacity exceptions.</div><div className="rx-us-exceptions"><div className="head"><span>TASK ID</span><span>TASK / CUSTOMER NEED</span><span>TYPE</span><span>EXPECTED PRODUCT</span><span>EEIs</span><span>UPAD ASSIGNMENT</span></div>{openDeck.tasks.map(t=>{const p=primary(openDeck);const effective=exceptions[t.id]||p;return <div className="row" key={t.id}><strong>{t.id}</strong><span><b>{t.title}</b><small>{t.need}</small></span><span>{t.type}</span><span>{t.product}</span><span>{t.eeis}</span><select value={effective} onChange={ev=>setExceptions(c=>({...c,[t.id]:ev.target.value}))}><option value={p}>PRIMARY · {p||'UNASSIGNED'}</option>{upads.filter(u=>u.id!==p).map(u=><option value={u.id} key={u.id}>{u.id} · {u.skills.join('/')}</option>)}</select></div>})}</div></div></div>}
 </div>
}

export default function CurrentOperationsRouter({
 role,missionState,onNavigate,onToggleProtection,onReleaseAsset,onUpdateMission,onUpdateRequirement,onValidateRequirement,onSendRequirementForward,onUpdateDelivery,
 advisorProps,onEndExercise
}){
 const common={role,missionState,onNavigate,onToggleProtection,onReleaseAsset,onUpdateMission,onUpdateRequirement,onValidateRequirement,onSendRequirementForward,onUpdateDelivery}
 const View=role==='remote_sensing_manager'?ManagerView:role==='collection_manager'?CollectionView:role==='upad_lno'?UPADView:CoordinatorView
 const [sidebarWidth,setSidebarWidth]=useStoredSize('nexus-rs-sidebar-width',152,118,250)
 const resizeSidebar=(delta)=>setSidebarWidth(v=>Math.max(118,Math.min(250,v+delta.dx)))
 return <div className="rx-shell rx-shell-resizable" style={{'--rx-sidebar-width':`${sidebarWidth}px`}}>
  <LiveHeader role={role} missionState={missionState} onEnd={onEndExercise}/>
  <Sidebar role={role} active={role==='collection_manager'?'requirements':role==='upad_lno'?'upad':'mission'} onNavigate={onNavigate}/>
  <DragHandle className="shell-left" onDrag={resizeSidebar}/>
  <main className="rx-main"><View {...common}/></main>
  <AdvisorColumn {...advisorProps}/>
 </div>
}

