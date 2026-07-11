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

 const incidents=[
  {id:'F1',name:'Pine Ridge',lat:40.15,lng:-121.75,tone:'red'},
  {id:'F2',name:'Canyon Creek',lat:39.55,lng:-121.25,tone:'orange'},
  {id:'F3',name:'Eagle Peak',lat:38.95,lng:-121.82,tone:'amber'},
 ]
 const missionDefaults=[
  {label:'MQ-9-01',lat:39.95,lng:-122.05},
  {label:'LUH-72-01',lat:39.35,lng:-121.32},
  {label:'CAP-01',lat:38.82,lng:-122.18},
 ]
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
  <div className="rx-legend"><strong>LEGEND</strong><span>🔴 Fire 1 – Pine Ridge</span><span>🟠 Fire 2 – Canyon Creek</span><span>🟡 Fire 3 – Eagle Peak</span><span>✈ Airborne Platform</span><span>◯ TFR / Airspace</span></div>
  {incidents.map(item=>{
   const p=markerPosition(item.lat,item.lng)
   return <button key={item.id} type="button" className={`rx-map-fire ${item.tone}`} style={{left:p.left,top:p.top}} title={`${item.id} — ${item.name}`}>
    <span>🔥</span><b>{item.id}</b><small>{item.name}</small>
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

 const update=(field,value)=>setDraft(d=>({...d,[field]:value}))
 const addToDeck=()=>{
  onUpdateRequirement?.(selected.id,draft)
  onValidateRequirement?.(selected.id)
  onAddToDeck?.({...selected,...draft,status:'ready'})
 }

 return <Panel title="REQUIREMENTS DEVELOPMENT WORKSPACE" className="rx-requirement-workspace">
  <div className="rx-req-dev-grid rx-req-dev-grid-deck">
   <section>
    <h4>CUSTOMER REQUEST (RAW)</h4>
    <dl>
     <div><dt>Request ID</dt><dd>{selected.id||'—'}</dd></div>
     <div><dt>Customer</dt><dd>{selected.customer||'—'}</dd></div>
     <div><dt>Priority</dt><dd><em className={tone(selected.priority||'high')}>{String(selected.priority||'HIGH').toUpperCase()}</em></dd></div>
    </dl>
    <p className="rx-raw-request">{selected.what||selected.title||'Customer request requires clarification.'}</p>
    <dl>
     <div><dt>Associated Incident</dt><dd>{selected.fire||selected.incident||'—'}</dd></div>
     <div><dt>Desired By / LTIOV</dt><dd>{selected.when||selected.ltiov||'1800L'}</dd></div>
    </dl>
   </section>

   <section>
    <h4>REFINED COLLECTION REQUIREMENT (DRAFT)</h4>
    <div className="rx-form-grid">
     <label>Decision to Support<input value={draft.decisionToSupport||''} onChange={e=>update('decisionToSupport',e.target.value)}/></label>
     <label>Location / NAI<input value={draft.nai||draft.location||''} onChange={e=>update('nai',e.target.value)}/></label>
     <label className="wide">Information Need / Description<textarea value={draft.what||''} onChange={e=>update('what',e.target.value)}/></label>
     <label>LTIOV<input value={draft.when||draft.ltiov||''} onChange={e=>update('when',e.target.value)}/></label>
     <label>Required Capability<input value={draft.requiredCapability||draft.requiredEffect||''} onChange={e=>update('requiredCapability',e.target.value)}/></label>
     <label className="wide">Essential Elements of Information (EEIs)<textarea value={(draft.eeis||[]).join('\n')} onChange={e=>update('eeis',e.target.value.split('\n').filter(Boolean))}/></label>
     <label>Acquisition Window<select value={draft.collectionWindow||'OP 2'} onChange={e=>update('collectionWindow',e.target.value)}><option>OP 1</option><option>OP 2</option></select></label>
     <label>Alternate Sources<input value={draft.alternateSource||''} onChange={e=>update('alternateSource',e.target.value)}/></label>
    </div>
    <div className="rx-form-actions">
     <span>Feasibility Status <b>{draft.status==='ready'?'READY':'PENDING REVIEW'}</b></span>
     <button onClick={addToDeck}>ADD TO COLLECTION DECK</button>
    </div>
   </section>

   <section>
    <h4>INCOMING REQUIREMENT QUEUE</h4>
    {reqs.slice(0,5).map(r=><button
      className={`rx-queue-item ${r.id===selected.id?'selected':''}`}
      key={r.id}
      onClick={()=>onSelectRequirement?.(r.id)}
     >
      <strong>{String(r.id||'').toUpperCase()} &nbsp; {r.fire||r.incident||''}</strong>
      <span>{r.title||r.what}</span>
      <em>{r.status||'draft'}</em>
     </button>)}
   </section>
  </div>
 </Panel>
}
function Taskability({missionState}){
 return <Panel title="TASKABILITY & COLLECTION OPTIONS" className="rx-taskability"><div className="rx-three">
  <section><h4>PLATFORM SUITABILITY (OP 2)</h4>{(missionState.assetControl?.assets||[]).slice(0,3).map((a,i)=><div key={a.id}><span>✈ &nbsp; {a.type}</span><b>{['Good Fit','Moderate Fit','Limited Fit'][i]}</b><i className={`rx-dot ${['green','amber','red'][i]}`}/></div>)}</section>
  <section><h4>CONSTRAINTS & CONSIDERATIONS</h4>{[['Airspace','TFR near collection area'],['Intel Oversight','Wide area collection – Privacy concern'],['Weather','Hazy, smoke layers in area'],['Other','Civil air traffic in corridor']].map(x=><div key={x[0]}><span>{x[0]}</span><b>{x[1]}</b></div>)}</section>
  <section><h4>RECOMMENDATION</h4><p>Use effects-based matching for the OP 2 collection window. Coordinate airspace timing and preserve alternate-source options.</p><Button>MARK READY FOR PLAN</Button></section>
 </div></Panel>
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
      <th>ID</th><th>PRI</th><th>STATE</th><th>LOCATION</th><th>LOCATION DESCRIPTION</th>
      <th>CENTER POINT</th><th>RADIUS</th><th>PIR</th><th>EEI / WHAT ARE YOU LOOKING FOR</th>
      <th>REQUIRED CAPABILITY</th><th>RESOLUTION</th><th>PERIODICITY</th><th>JUSTIFICATION</th>
      <th>PRE-EVENT</th><th>LTIOV</th><th>ACQ START</th><th>ACQ END</th>
      <th>REPORTING INSTRUCTIONS</th><th>SPECIAL INSTRUCTIONS</th><th>STATUS</th>
     </tr></thead>
     <tbody>{rows.map(row=><tr key={row.id}>
      <td>{row.id}</td><td><em className={tone(row.priority)}>{row.priority}</em></td><td>{row.state}</td>
      <td>{row.location}</td><td>{row.description}</td><td>{row.centerPoint}</td><td>{row.radius}</td>
      <td>{row.pir}</td><td>{row.eei}</td><td>{row.capability}</td><td>{row.resolution}</td>
      <td>{row.periodicity}</td><td>{row.justification}</td><td>{row.preEvent}</td><td>{row.ltiov}</td>
      <td>{row.acquisitionStart}</td><td>{row.acquisitionEnd}</td><td>{row.reporting}</td>
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

function ActiveCollectionDeck({items,onOpen}){
 const rows=items.map(buildDeckRow)
 return <Panel title="ACTIVE COLLECTION DECK — OP 2 / SORTIE 01" className="rx-active-deck">
  <div className="rx-active-deck-meta">
   <span><b>{rows.length}</b> REQUIREMENTS</span>
   <span><b>{rows.filter(r=>r.status.includes('READY')).length}</b> READY</span>
   <span><b>{rows.filter(r=>!r.status.includes('READY')).length}</b> REVIEW</span>
  </div>
  <div className="rx-deck-preview-table">
   <div className="head"><span>PRI</span><span>ID</span><span>LOCATION</span><span>EEI / COLLECTION NEED</span><span>LTIOV</span><span>STATUS</span></div>
   {rows.slice(0,6).map(row=><div className="row" key={row.id}>
    <span><em className={tone(row.priority)}>{row.priority}</em></span>
    <strong>{row.id}</strong><span>{row.location}</span><span>{row.eei}</span><span>{row.ltiov}</span><span>{row.status}</span>
   </div>)}
  </div>
  <Button onClick={onOpen}>OPEN FULL COLLECTION DECK</Button>
 </Panel>
}

function CollectionView(props){
 const {missionState,role,onNavigate,onUpdateRequirement,onValidateRequirement,onSendRequirementForward}=props
 const requirements=missionState.requirements?.items||[]
 const [selectedRequirementId,setSelectedRequirementId]=useState(requirements[0]?.id)
 const [deckItems,setDeckItems]=useState(()=>{
  try{
   const saved=JSON.parse(localStorage.getItem('nexus-rs-collection-deck-draft')||'null')
   if(Array.isArray(saved)&&saved.length) return saved
  }catch{}
  return requirements.slice(0,3).map((r,index)=>({...r,status:index===1?'draft':'ready'}))
 })
 const [showDeck,setShowDeck]=useState(false)

 useEffect(()=>{
  localStorage.setItem('nexus-rs-collection-deck-draft',JSON.stringify(deckItems))
 },[deckItems])

 const addToDeck=(requirement)=>{
  setDeckItems(current=>{
   const exists=current.some(item=>item.id===requirement.id)
   return exists?current.map(item=>item.id===requirement.id?{...item,...requirement}:item):[...current,requirement]
  })
  onSendRequirementForward?.(requirement.id)
 }

 return <div className="rx-role-layout collection rx-collection-ppt-layout">
  <style>{`
   .rx-collection-ppt-layout{display:grid;grid-template-rows:auto auto minmax(315px,1fr);gap:10px;min-height:calc(100vh - 96px)}
   .rx-collection-requirements-row{min-height:310px}
   .rx-collection-requirements-row>.rx-panel{height:100%}
   .rx-collection-ppt-layout .rx-requirement-workspace{height:100%;display:flex;flex-direction:column}
   .rx-collection-ppt-layout .rx-requirement-workspace>.rx-req-dev-grid-deck{flex:1}
   .rx-collection-ppt-layout .rx-req-dev-grid-deck{grid-template-columns:24% minmax(0,50%) 26%;gap:10px}
   .rx-collection-ppt-layout .rx-requirement-workspace section{min-height:0}
   .rx-collection-ppt-layout .rx-form-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
   .rx-collection-ppt-layout .rx-form-grid label{font-size:8px}
   .rx-collection-ppt-layout .rx-form-grid input,
   .rx-collection-ppt-layout .rx-form-grid select{height:27px}
   .rx-collection-ppt-layout .rx-form-grid textarea{min-height:48px}
   .rx-collection-ppt-layout .rx-form-actions{margin-top:7px}
   .rx-collection-ppt-layout .rx-middle-work-row{min-height:185px}
   .rx-collection-ppt-layout .rx-middle-work-row>.rx-panel{height:100%;display:flex;flex-direction:column}
   .rx-collection-ppt-layout .rx-middle-work-row .rx-outline-button{margin-top:auto}
   .rx-collection-ppt-layout .rx-active-deck{height:100%;display:flex;flex-direction:column}
   .rx-collection-ppt-layout .rx-active-deck>.rx-outline-button{margin-top:auto}
   .rx-active-deck-meta{display:flex;gap:18px;padding:7px 10px;border-bottom:1px solid rgba(127,232,244,.15);color:#9eb2bf;font-size:10px}
   .rx-active-deck-meta b{color:#7fe8f4;font-size:15px;margin-right:4px}
   .rx-deck-preview-table{min-width:0}
   .rx-deck-preview-table .head,.rx-deck-preview-table .row{display:grid;grid-template-columns:48px 72px 1fr 2fr 62px 75px;gap:8px;align-items:center}
   .rx-deck-preview-table .head{padding:7px 9px;color:#7f96a5;font-size:8px;border-bottom:1px solid rgba(127,232,244,.18)}
   .rx-deck-preview-table .row{padding:8px 9px;border-bottom:1px solid rgba(127,232,244,.12);font-size:10px}
   .rx-deck-preview-table .row>span:nth-child(4){white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
   .rx-collection-map-row{min-height:330px}
   .rx-collection-map-row>.rx-panel{height:100%}
   .rx-collection-support-stack{display:grid;grid-template-rows:minmax(120px,.8fr) minmax(130px,1fr);gap:10px;min-height:0}
   .rx-collection-support-stack>.rx-panel{min-height:0;display:flex;flex-direction:column}
   .rx-collection-support-stack .rx-outline-button{margin-top:auto}
   .rx-deck-modal{position:fixed;inset:0;z-index:9999;background:rgba(0,8,15,.9);display:flex;align-items:center;justify-content:center;padding:24px}
   .rx-deck-modal-card{width:min(96vw,1800px);height:min(92vh,1000px);background:#071827;border:1px solid #2a7189;display:flex;flex-direction:column;box-shadow:0 25px 80px #000}
   .rx-deck-modal-card>header{display:flex;justify-content:space-between;align-items:flex-start;padding:16px 18px;border-bottom:1px solid #21485b}
   .rx-deck-modal-card header span{color:#63e1ee;font-size:10px;letter-spacing:.12em}
   .rx-deck-modal-card h2{margin:3px 0;color:#f2f7fa;font-size:22px}
   .rx-deck-modal-card p{margin:0;color:#91a9b6;font-size:11px}
   .rx-deck-modal-card button{border:1px solid #3fbfd2;background:#0a2736;color:#8deaf3;padding:9px 15px;font-weight:700;cursor:pointer}
   .rx-deck-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#21485b;border-bottom:1px solid #21485b}
   .rx-deck-summary>div{background:#0a1d2b;padding:10px 12px}
   .rx-deck-summary span{display:block;color:#76909f;font-size:8px}
   .rx-deck-summary strong{color:#e7f1f5;font-size:11px}
   .rx-deck-table-wrap{overflow:auto;flex:1}
   .rx-deck-full-table{border-collapse:collapse;min-width:2400px;width:100%;font-size:9px}
   .rx-deck-full-table th{position:sticky;top:0;background:#102838;color:#7fe8f4;text-align:left;padding:8px;border:1px solid #284a5d;z-index:2}
   .rx-deck-full-table td{vertical-align:top;padding:8px;border:1px solid #1d3b4c;color:#c3d1d9;max-width:220px}
   .rx-deck-full-table tbody tr:nth-child(even){background:rgba(19,51,68,.3)}
   .rx-deck-modal-card>footer{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-top:1px solid #21485b;color:#9cb0bb;font-size:10px}
   @media(max-width:1200px){
    .rx-collection-ppt-layout .rx-req-dev-grid-deck{grid-template-columns:1fr}
    .rx-collection-ppt-layout{grid-template-rows:auto auto auto}
    .rx-collection-map-row{grid-template-columns:1fr!important}
   }
   @media print{
    body *{visibility:hidden!important}
    .rx-deck-modal,.rx-deck-modal *{visibility:visible!important}
    .rx-deck-modal{position:absolute;inset:0;padding:0;background:white}
    .rx-deck-modal-card{width:100%;height:auto;box-shadow:none}
    .rx-deck-modal-card>header button,.rx-deck-modal-card>footer button{display:none}
   }
  `}</style>

  <div className="rx-collection-requirements-row">
   <RequirementDevelopment
    missionState={missionState}
    onUpdateRequirement={onUpdateRequirement}
    onValidateRequirement={onValidateRequirement}
    onAddToDeck={addToDeck}
    selectedRequirementId={selectedRequirementId}
    onSelectRequirement={setSelectedRequirementId}
   />
  </div>

  <ResizableRow storageKey="nexus-rs-collection-middle-work-v2" initial={[56,44]} min={28} className="rx-middle-work-row">
   <Taskability missionState={missionState}/>
   <ActiveCollectionDeck items={deckItems} onOpen={()=>setShowDeck(true)}/>
  </ResizableRow>

  <ResizableRow storageKey="nexus-rs-collection-map-support-v2" initial={[58,42]} min={30} className="rx-collection-map-row">
   <RegionalMissionPicture role={role} missionState={missionState}/>
   <div className="rx-collection-support-stack">
    <DeadlinesCard role={role}/>
    <AirspacePanel/>
   </div>
  </ResizableRow>

  {showDeck&&<CollectionDeckOutput items={deckItems} onClose={()=>setShowDeck(false)}/>}
 </div>
}
function UPADView(props){
 const {missionState,role,onNavigate,onUpdateDelivery}=props
 return <div className="rx-role-layout upad">
  <div className="rx-top-grid"><CurrentPeriodCard role={role} missionState={missionState}/><TomorrowCard role={role} missionState={missionState} onNavigate={onNavigate}/><DeadlinesCard role={role}/></div>
  <UPADOverview missionState={missionState} onUpdateDelivery={onUpdateDelivery}/>
  <div className="rx-three-grid"><Panel title="UPAD CAPACITY & CONSTRAINTS" accent="purple" className="rx-small-list"><ul>{[['Total Processing Capacity','High'],['Network Bandwidth','Limited'],['Exploitation Specialists','Tight'],['Pilot / Crew Availability','Limited'],['System Availability','Good'],['Launch Turn Time','Moderate']].map(x=><li key={x[0]}>{x[0]}<em>{x[1]}</em></li>)}</ul><Button>VIEW UPAD DETAILS</Button></Panel><UPADTable missionState={missionState}/><Panel title="UPAD SUPPORT REQUESTS" accent="purple" className="rx-small-list"><ul>{['Additional Bandwidth','Extra Exploitation Support','Accelerated Processing','Alternate Landing Site'].map((x,i)=><li key={x}>{x}<span>U{i+1} &nbsp; OPEN</span></li>)}</ul><Button>VIEW ALL REQUESTS</Button></Panel></div>
  <div className="rx-three-grid bottom"><RegionalMissionPicture role={role} missionState={missionState}/><AirspacePanel/><OversightPanel missionState={missionState}/></div>
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

