import { useEffect, useMemo, useState } from 'react'

const HOURS = Array.from({length:24},(_,i)=>i)
const ASSET_ROWS = [
  'MQ-9',
  'LUH-72',
  'CAP',
  'DoD Partner Asset',
  'Forest Service Asset',
  'State Partner Asset',
  'Contract Collection Asset',
  'Satellite Source',
]

const PERMISSIONS = {
  remote_sensing_coordinator: {
    sorties:false, requirements:false, upad:false, gaps:true, approval:true,
    note:'Regional integration, partner coordination, gap resolution, and approval.',
  },
  remote_sensing_manager: {
    sorties:true, requirements:false, upad:false, gaps:true, approval:false,
    note:'Execution accuracy, sortie changes, retasks, and mission status.',
  },
  collection_manager: {
    sorties:false, requirements:true, upad:false, gaps:true, approval:false,
    note:'Requirement development, EEIs, collection windows, and draft-plan effects.',
  },
  upad_lno: {
    sorties:false, requirements:false, upad:true, gaps:false, approval:false,
    note:'UPAD assignment, product status, delivery risk, and handoff.',
  },
}

const DEFAULT_DRAFT_ASSETS = ['MQ-9','LUH-72','CAP','DoD Partner Asset']

function safeHour(value,fallback){
  const parsed=Number(String(value??'').replace(/[^\d]/g,'').slice(0,2))
  return Number.isFinite(parsed)&&parsed>=0&&parsed<=23?parsed:fallback
}

function normalizePriority(value){
  if(typeof value==='number') return value===1?'HIGH':value===2?'MED':'LOW'
  return String(value||'MED').toUpperCase()
}

function deckToDraftSorties(items=[]){
  const defaultSorties={
    'mq9-sortie-01':{asset:'MQ-9',start:9,end:14,label:'MQ-9 / SORTIE 01'},
    'luh72-sortie-02':{asset:'LUH-72',start:11,end:16,label:'LUH-72 / SORTIE 02'},
    'cap-sortie-03':{asset:'CAP',start:13,end:18,label:'CAP / SORTIE 03'},
  }
  return items.map((item,index)=>{
    const assigned=defaultSorties[item.assignedSortieId]||{
      asset:item.assignedSortieAsset,
      start:item.assignedSortieStart,
      end:item.assignedSortieEnd,
      label:item.assignedSortieLabel,
    }
    const sequence=Math.max(1,Number(item.deckSequence)||index+1)
    const baseStart=Number(assigned.start||safeHour(item.acquisitionStart||item.collectionStart||item.start,[9,11,13,15][index%4]))
    const start=Math.min(23,baseStart+sequence-1)
    const end=Math.min(24,start+1)
    const asset=assigned.asset||item.asset||item.platform||item.requiredPlatform||'UNASSIGNED'
    const requirement=String(item.id||`REQ-${index+1}`).toUpperCase()
    const fire=item.fire||item.incident||item.location||item.nai||`Collection Area ${index+1}`
    const objective=item.what||item.title||item.decisionToSupport||'Collection requirement'
    return {
      id:`draft-${requirement}`,
      identifier:assigned.label||`${asset} / UNASSIGNED`,
      asset,
      fire,
      requirement,
      objective,
      start,
      end,
      upad:item.upad||'Unassigned',
      productStatus:item.productStatus||'NOT STARTED',
      missionStatus:item.assignedSortieId?`SEQUENCE ${sequence}`:'UNASSIGNED',
      protected:Boolean(item.protected),
      priority:normalizePriority(item.priority),
      ltiov:item.when||item.ltiov||'—',
      eeis:item.eeis||[],
      isDraft:true,
    }
  })
}

function viewHours(sorties){
  const start=Math.min(6,...sorties.map(s=>s.start))
  const end=Math.max(22,...sorties.map(s=>s.end))
  return Array.from({length:(end-start)+1},(_,i)=>start+i)
}

function MatrixTimeline({sorties,selectedId,onSelect,draft=false}){
  const hours=viewHours(sorties)
  const first=hours[0]
  const last=hours[hours.length-1]
  const span=Math.max(1,last-first)

  const rows=useMemo(()=>{
    const assets=[...ASSET_ROWS]
    sorties.forEach(sortie=>{
      if(!assets.includes(sortie.asset)) assets.push(sortie.asset)
    })
    return assets
  },[sorties])

  const entriesByAsset=useMemo(
    ()=>Object.fromEntries(rows.map(row=>[row,sorties.filter(sortie=>sortie.asset===row)])),
    [rows,sorties],
  )

  const left=sortie=>`${((sortie.start-first)/span)*100}%`
  const width=sortie=>`${Math.max(4,((sortie.end-sortie.start)/span)*100)}%`

  return <div className="nrx-sync-timeline-scroll">
    <div className="nrx-sync-timeline" style={{'--nrx-hour-count':hours.length}}>
      <div className="nrx-sync-time-row">
        <div className="nrx-sync-row-label">LOCAL</div>
        <div className="nrx-sync-hours">{hours.map(hour=><span key={hour}>{String(hour).padStart(2,'0')}00</span>)}</div>
      </div>

      {rows.map(row=><div className="nrx-sync-asset-row" key={row}>
        <div className="nrx-sync-row-label">{row}</div>
        <div className="nrx-sync-track">
          {hours.slice(0,-1).map(hour=><i key={hour}/>)}
          {entriesByAsset[row].map(sortie=><button
            key={sortie.id}
            type="button"
            className={[
              'nrx-sync-block',
              selectedId===sortie.id?'selected':'',
              sortie.protected?'protected':'',
              draft?'draft':'',
              String(sortie.missionStatus).toLowerCase().includes('ready')?'ready':'',
            ].join(' ')}
            style={{left:left(sortie),width:width(sortie)}}
            onClick={()=>onSelect(sortie.id)}
            title={`${sortie.identifier} · ${sortie.requirement}`}
          >
            <strong>{sortie.identifier}</strong>
            <span>{String(sortie.start).padStart(2,'0')}00–{String(sortie.end).padStart(2,'0')}00</span>
            <small>{sortie.fire} · {sortie.requirement}</small>
          </button>)}
        </div>
      </div>)}
    </div>
  </div>
}

function ImpactSummary({sorties,draft=false}){
  const overlaps=[]
  const gaps=[]
  const byAsset=sorties.reduce((acc,sortie)=>{
    const key=sortie.asset||'Unassigned'
    if(!acc[key]) acc[key]=[]
    acc[key].push(sortie)
    return acc
  },{})

  Object.entries(byAsset).forEach(([asset,items])=>{
    const ordered=[...items].sort((a,b)=>a.start-b.start)
    ordered.forEach((item,index)=>{
      const next=ordered[index+1]
      if(next&&next.start<item.end){
        overlaps.push(`${asset}: ${item.requirement} overlaps ${next.requirement}`)
      }
    })
  })

  const incidentNames=[...new Set(sorties.map(s=>s.fire).filter(Boolean))]
  incidentNames.forEach(incident=>{
    const incidentSorties=sorties.filter(s=>s.fire===incident)
    if(!incidentSorties.length) gaps.push(`${incident}: no collection scheduled`)
  })

  const upadLoad=sorties.reduce((acc,sortie)=>{
    const key=sortie.upad||'Unassigned'
    acc[key]=(acc[key]||0)+1
    return acc
  },{})

  return <div className="nrx-sync-impact-grid">
    <article>
      <div className="nrx-sync-impact-head"><h3>{draft?'DRAFT PLAN EFFECTS':'EXECUTION SUMMARY'}</h3><span>{sorties.length} SORTIES</span></div>
      <dl>
        <div><dt>Collection Hours</dt><dd>{sorties.reduce((sum,s)=>sum+(s.end-s.start),0)} hrs</dd></div>
        <div><dt>Incidents Covered</dt><dd>{incidentNames.length}</dd></div>
        <div><dt>Potential Overlaps</dt><dd className={overlaps.length?'warn':'good'}>{overlaps.length}</dd></div>
        <div><dt>Unassigned UPAD</dt><dd className={upadLoad.Unassigned?'warn':'good'}>{upadLoad.Unassigned||0}</dd></div>
      </dl>
    </article>

    <article>
      <div className="nrx-sync-impact-head"><h3>{draft?'WHAT CHANGED':'CURRENT FRICTION'}</h3></div>
      <ul>
        {(overlaps.length?overlaps:[
          draft?'No asset-time conflicts in the current draft.':'No active asset-time conflicts.',
        ]).slice(0,4).map(item=><li key={item}>{item}</li>)}
      </ul>
    </article>

    <article>
      <div className="nrx-sync-impact-head"><h3>UPAD / PRODUCT FLOW</h3></div>
      <ul>
        {Object.entries(upadLoad).map(([upad,count])=><li key={upad}><strong>{upad}</strong><span>{count} collection{count===1?'':'s'}</span></li>)}
      </ul>
    </article>
  </div>
}

export default function SyncMatrix({
  role,
  matrix,
  onUpdateSortie,
  onResolveNeed,
  onResolveGap,
  onApprove,
  onAddLeadershipNote,
}){
  const [mode,setMode]=useState(role==='collection_manager'?'tomorrow':'today')
  const [draftDeck,setDraftDeck]=useState([])
  const permission=PERMISSIONS[role]||PERMISSIONS.remote_sensing_coordinator

  useEffect(()=>{
    const loadDraft=()=>{
      try{
        const saved=JSON.parse(localStorage.getItem('nexus-rs-collection-deck-draft')||'[]')
        setDraftDeck(Array.isArray(saved)?saved:[])
      }catch{
        setDraftDeck([])
      }
    }
    loadDraft()
    window.addEventListener('storage',loadDraft)
    window.addEventListener('focus',loadDraft)
    document.addEventListener('visibilitychange',loadDraft)
    return ()=>{
      window.removeEventListener('storage',loadDraft)
      window.removeEventListener('focus',loadDraft)
      document.removeEventListener('visibilitychange',loadDraft)
    }
  },[])

  const todaySorties=matrix?.sorties||[]
  const tomorrowSorties=useMemo(()=>deckToDraftSorties(draftDeck),[draftDeck])
  const sorties=mode==='today'?todaySorties:tomorrowSorties
  const [selectedId,setSelectedId]=useState(sorties[0]?.id)

  useEffect(()=>{
    setSelectedId(sorties[0]?.id)
  },[mode,sorties.length])

  const selected=sorties.find(sortie=>sortie.id===selectedId)||sorties[0]
  const update=(field,value)=>{
    if(mode==='today'&&selected&&!selected.isDraft) onUpdateSortie?.(selected.id,{[field]:value})
  }

  return <div className="nrx-sync-page">
    <style>{`
      .nrx-sync-page{display:flex;flex-direction:column;gap:10px;min-width:0}
      .nrx-sync-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;background:#071d2b;border:1px solid #17435a;border-radius:6px}
      .nrx-sync-tabs{display:flex;gap:7px}
      .nrx-sync-tabs button{height:32px;padding:0 15px;border:1px solid #24536a;background:#081927;color:#96adba;font-size:10px;font-weight:700;letter-spacing:.04em;cursor:pointer}
      .nrx-sync-tabs button.active{background:#0d6977;border-color:#25cbd8;color:#efffff}
      .nrx-sync-toolbar-text{text-align:right}
      .nrx-sync-toolbar-text strong{display:block;color:#e7f2f6;font-size:12px}
      .nrx-sync-toolbar-text span{display:block;color:#7f98a7;font-size:9px;margin-top:2px}
      .nrx-sync-main{display:grid;grid-template-columns:minmax(0,1fr) 290px;gap:10px}
      .nrx-sync-board,.nrx-sync-detail,.nrx-sync-impact-grid>article{background:#071d2b;border:1px solid #17435a;border-radius:6px;overflow:hidden}
      .nrx-sync-title{display:flex;justify-content:space-between;gap:12px;padding:12px;border-bottom:1px solid #17435a}
      .nrx-sync-title span{display:block;color:#41dce8;font-size:9px;letter-spacing:.08em}
      .nrx-sync-title h2{margin:3px 0 0;color:#edf6fa;font-size:17px}
      .nrx-sync-title p{margin:4px 0 0;color:#829aa9;font-size:9px}
      .nrx-sync-chip{align-self:flex-start;padding:4px 8px;border:1px solid #bd8b1f;color:#ffc94d;background:rgba(189,139,31,.12);font-size:8px}
      .nrx-sync-authority{padding:7px 12px;border-bottom:1px solid #17435a;color:#8ea7b5;font-size:9px}
      .nrx-sync-authority strong{color:#dbe7ec}
      .nrx-sync-timeline-scroll{overflow:auto;padding:0 0 8px}
      .nrx-sync-timeline{min-width:1120px}
      .nrx-sync-time-row,.nrx-sync-asset-row{display:grid;grid-template-columns:145px minmax(900px,1fr)}
      .nrx-sync-row-label{display:flex;align-items:center;padding:0 10px;border-right:1px solid #17435a;border-bottom:1px solid #17384b;color:#d8e4e9;font-size:10px;font-weight:700}
      .nrx-sync-hours{display:grid;grid-template-columns:repeat(var(--nrx-hour-count),1fr);height:31px;border-bottom:1px solid #17435a}
      .nrx-sync-hours span{display:flex;align-items:center;justify-content:center;border-right:1px solid #17384b;color:#7f98a7;font-size:8px}
      .nrx-sync-asset-row{min-height:48px}
      .nrx-sync-track{position:relative;border-bottom:1px solid #17384b;background:rgba(3,17,30,.32)}
      .nrx-sync-track>i{position:relative;display:inline-block;width:calc(100% / (var(--nrx-hour-count) - 1));height:100%;border-right:1px solid rgba(23,56,75,.75)}
      .nrx-sync-block{position:absolute;top:6px;height:35px;z-index:2;border:1px solid #228f9b;background:linear-gradient(90deg,#0a5660,#0d747b);color:#eaffff;border-radius:4px;padding:3px 7px;text-align:left;overflow:hidden;cursor:pointer}
      .nrx-sync-block.draft{border-style:dashed;background:linear-gradient(90deg,#173c61,#225887)}
      .nrx-sync-block.ready{border-color:#32d7c4}
      .nrx-sync-block.selected{box-shadow:0 0 0 2px rgba(127,232,244,.75)}
      .nrx-sync-block.protected:after{content:'P';position:absolute;right:4px;top:3px;color:#ffd45c;font-size:7px}
      .nrx-sync-block strong,.nrx-sync-block span,.nrx-sync-block small{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .nrx-sync-block strong{font-size:8px}.nrx-sync-block span{font-size:7px}.nrx-sync-block small{font-size:7px;color:#bcd0d8}
      .nrx-sync-detail header{padding:11px 12px;border-bottom:1px solid #17435a}
      .nrx-sync-detail h3{margin:0;color:#47dbe8;font-size:12px}
      .nrx-sync-detail-body{display:flex;flex-direction:column;gap:9px;padding:11px}
      .nrx-sync-detail-body label{display:flex;flex-direction:column;gap:4px;color:#839caa;font-size:8px}
      .nrx-sync-detail-body input,.nrx-sync-detail-body select{height:31px;padding:0 8px;border:1px solid #21485c;background:#041523;color:#e6f0f4;font-size:10px}
      .nrx-sync-detail-empty{padding:18px;color:#78909d;font-size:10px}
      .nrx-sync-impact-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
      .nrx-sync-impact-head{display:flex;justify-content:space-between;padding:9px 11px;border-bottom:1px solid #17435a}
      .nrx-sync-impact-head h3{margin:0;color:#45dbe7;font-size:10px}
      .nrx-sync-impact-head span{color:#91a7b4;font-size:8px}
      .nrx-sync-impact-grid dl{display:grid;grid-template-columns:1fr 1fr;margin:0}
      .nrx-sync-impact-grid dl div{padding:10px;border-right:1px solid #17384b;border-bottom:1px solid #17384b}
      .nrx-sync-impact-grid dt{color:#839aa7;font-size:8px}.nrx-sync-impact-grid dd{margin:3px 0 0;color:#e7f1f5;font-size:14px}
      .nrx-sync-impact-grid dd.warn{color:#ffc454}.nrx-sync-impact-grid dd.good{color:#4ee0cd}
      .nrx-sync-impact-grid ul{list-style:none;margin:0;padding:8px 11px}
      .nrx-sync-impact-grid li{display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid #17384b;color:#c4d3db;font-size:9px}
      .nrx-sync-impact-grid li:last-child{border-bottom:0}
      @media(max-width:1100px){.nrx-sync-main{grid-template-columns:1fr}.nrx-sync-impact-grid{grid-template-columns:1fr}}
    `}</style>

    <div className="nrx-sync-toolbar">
      <div className="nrx-sync-tabs">
        <button className={mode==='today'?'active':''} onClick={()=>setMode('today')}>TODAY'S SYNC</button>
        <button className={mode==='tomorrow'?'active':''} onClick={()=>setMode('tomorrow')}>TOMORROW'S SYNC — DRAFT</button>
      </div>
      <div className="nrx-sync-toolbar-text">
        <strong>{mode==='today'?'Approved / Executing Collection Picture':'Developing Collection Plan'}</strong>
        <span>{mode==='today'?'Current operational-period baseline':'Updates from the Collection Manager collection deck'}</span>
      </div>
    </div>

    <div className="nrx-sync-main">
      <section className="nrx-sync-board">
        <div className="nrx-sync-title">
          <div>
            <span>{mode==='today'?'TODAY — EXECUTION BASELINE':'TOMORROW — DRAFT COLLECTION SYNC'}</span>
            <h2>{matrix?.operationalPeriod||'Operational Period'} · {matrix?.date||'Local Incident Date'}</h2>
            <p>Local incident time · {mode==='today'?`As of ${matrix?.asOf||'—'} · Version ${matrix?.version||'—'}`:'Live draft generated from the developing collection deck'}</p>
          </div>
          <span className="nrx-sync-chip">{mode==='today'?(matrix?.status||'ACTIVE'):'DRAFT — NOT APPROVED'}</span>
        </div>
        <div className="nrx-sync-authority"><strong>Role Authority:</strong> {permission.note}</div>
        {sorties.length
          ? <MatrixTimeline sorties={sorties} selectedId={selectedId} onSelect={setSelectedId} draft={mode==='tomorrow'}/>
          : <div className="nrx-sync-detail-empty">No requirements have been added to the Tomorrow collection deck yet.</div>}
      </section>

      <aside className="nrx-sync-detail">
        <header><h3>{mode==='today'?'SORTIE DETAIL':'DRAFT COLLECTION DETAIL'}</h3></header>
        {selected?<div className="nrx-sync-detail-body">
          <label>Asset<input value={selected.identifier||selected.asset} disabled/></label>
          <label>Incident / Area<input value={selected.fire||''} disabled/></label>
          <label>Requirement<input value={selected.requirement||''} disabled={mode==='today'||!permission.requirements} onChange={event=>update('requirement',event.target.value)}/></label>
          <label>Collection Objective<input value={selected.objective||''} disabled={mode==='today'||!permission.requirements} onChange={event=>update('objective',event.target.value)}/></label>
          <label>Window<input value={`${String(selected.start).padStart(2,'0')}00–${String(selected.end).padStart(2,'0')}00`} disabled/></label>
          <label>LTIOV<input value={selected.ltiov||'—'} disabled/></label>
          <label>Assigned UPAD<input value={selected.upad||'Unassigned'} disabled/></label>
          <label>Status<input value={selected.missionStatus||'—'} disabled/></label>
        </div>:<div className="nrx-sync-detail-empty">Select a sortie or add requirements to the draft deck.</div>}
      </aside>
    </div>

    <ImpactSummary sorties={sorties} draft={mode==='tomorrow'}/>

    {mode==='today'&&matrix&&<section className="support full stateful-support">
      <article className="panel">
        <div className="panel-head"><h3>Unmet Needs</h3><span className="chip red">{matrix.unmetNeeds?.filter(x=>x.status==='OPEN').length||0} OPEN</span></div>
        {(matrix.unmetNeeds||[]).map(item=><div className="support-record" key={item.id}>
          <strong>{item.requirement} · {item.fire}</strong><p>{item.window} Local · {item.reason}</p><small>Decision deadline: {item.deadline}</small>
          {item.status==='OPEN'&&permission.gaps&&<button className="secondary-button" onClick={()=>onResolveNeed?.(item.id)}>Mark Coordinating</button>}
        </div>)}
      </article>

      <article className="panel">
        <div className="panel-head"><h3>Coverage Gaps</h3><span className="chip amber">{matrix.coverageGaps?.filter(x=>x.status!=='RESOLVED').length||0} AT RISK</span></div>
        {(matrix.coverageGaps||[]).map(item=><div className="support-record" key={item.id}>
          <strong>{item.fire} · {item.window} Local</strong><p>{item.consequence}</p><small>{item.requirement} · {item.status}</small>
          {item.status!=='RESOLVED'&&permission.gaps&&<button className="secondary-button" onClick={()=>onResolveGap?.(item.id)}>Resolve Gap</button>}
        </div>)}
      </article>
    </section>}
  </div>
}
