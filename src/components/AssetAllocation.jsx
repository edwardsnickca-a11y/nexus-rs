import React, { useMemo, useState } from 'react'

const REQUEST_TYPES = ['Additional MQ-9','Additional LUH-72','Additional CAP','Different capability','Partner support']

export default function AssetAllocation({ role, missionState, onReleaseAsset, onSubmitRequest, onCancelRequest }) {
  const [form,setForm]=useState({requestType:'Additional LUH-72',quantity:1,requiredBy:'1400 Local',need:'',consequence:'',currentGap:''})
  const control=missionState.assetControl
  const isCoordinator=role==='remote_sensing_coordinator'
  const counts=useMemo(()=>control.assets.reduce((acc,a)=>{acc[a.type]=(acc[a.type]||0)+1;return acc},{}),[control.assets])
  const activeCount=control.assets.filter(a=>a.status==='assigned').length
  const reserveCount=control.assets.filter(a=>a.status==='reserve').length
  const releasedCount=control.assets.filter(a=>a.status==='released').length

  const submit=(e)=>{
    e.preventDefault()
    if(!form.need.trim()||!form.consequence.trim()||!form.currentGap.trim()) return
    onSubmitRequest({...form,quantity:Number(form.quantity)})
    setForm({requestType:'Additional LUH-72',quantity:1,requiredBy:'1400 Local',need:'',consequence:'',currentGap:''})
  }

  return <div className="asset-workspace">
    <section className="panel asset-hero">
      <div>
        <span className="eyebrow">Asset Allocation and Control</span>
        <h2>State-Allocated Remote Sensing Assets</h2>
        <p>Employ the assets already allocated to the mission, release unneeded capacity back to state control, and build a defensible request when current assets cannot satisfy the requirement.</p>
      </div>
      <div className="asset-summary">
        <div><span>State Authority</span><strong>{control.stateAuthority}</strong></div>
        <div><span>Assigned</span><strong>{activeCount}</strong></div>
        <div><span>Reserve</span><strong>{reserveCount}</strong></div>
        <div><span>Released</span><strong>{releasedCount}</strong></div>
      </div>
    </section>

    <section className="panel allocation-overview">
      <div className="panel-head"><div><span className="eyebrow">STARTEX Allocation</span><h3>Current State Allocation</h3></div><span className="chip teal">{control.allocationStatus}</span></div>
      <div className="allocation-counts">
        <div><strong>{counts['MQ-9']||0}</strong><span>MQ-9</span></div>
        <div><strong>{counts['LUH-72']||0}</strong><span>LUH-72</span></div>
        <div><strong>{counts['CAP']||0}</strong><span>CAP</span></div>
      </div>
      <div className="control-rule"><strong>Control rule:</strong> the RS Coordinator may allocate or release assigned state assets. Additional or different assets require a justified request to the State J3.</div>
    </section>

    <section className="panel asset-table-panel">
      <div className="panel-head"><h3>Allocated Asset Status</h3><span className="chip slate">LOCAL INCIDENT TIME</span></div>
      <div className="asset-table">
        <div className="asset-table-head"><span>Asset</span><span>Control</span><span>Status</span><span>Assignment</span><span>Recall Risk</span><span>Action</span></div>
        {control.assets.map(asset=><div className={`asset-table-row status-${asset.status}`} key={asset.id}>
          <span><strong>{asset.identifier}</strong><small>{asset.type}</small></span>
          <span>{asset.controlRelationship}</span>
          <span><strong>{asset.status.replace('_',' ').toUpperCase()}</strong></span>
          <span>{asset.assignment}</span>
          <span>{asset.recallRisk}</span>
          <span>
            {isCoordinator && asset.returnable && asset.status!=='released' ? <button className="mini-button secondary" onClick={()=>onReleaseAsset(asset.id)}>Release to State</button> : <span className="permission-note">{isCoordinator?'No action':'Coordinator action'}</span>}
          </span>
        </div>)}
      </div>
    </section>

    <section className="panel request-builder">
      <div className="panel-head"><div><span className="eyebrow">State J3 Request</span><h3>Request Additional or Different Capability</h3></div><span className={`chip ${isCoordinator?'amber':'slate'}`}>{isCoordinator?'COORDINATOR AUTHORITY':'READ ONLY'}</span></div>
      {!isCoordinator ? <div className="authority-banner"><strong>Role boundary:</strong> provide the operational impact through your chain. The Remote Sensing Coordinator makes the case to the State J3.</div> : null}
      <form onSubmit={submit} className="asset-request-form">
        <label>Capability requested<select value={form.requestType} onChange={e=>setForm({...form,requestType:e.target.value})} disabled={!isCoordinator}>{REQUEST_TYPES.map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Quantity<input type="number" min="1" max="6" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} disabled={!isCoordinator}/></label>
        <label>Required by<input value={form.requiredBy} onChange={e=>setForm({...form,requiredBy:e.target.value})} disabled={!isCoordinator}/></label>
        <label className="wide">Operational need<textarea value={form.need} onChange={e=>setForm({...form,need:e.target.value})} placeholder="What validated requirement or unmet need requires support?" disabled={!isCoordinator}/></label>
        <label className="wide">Why current assets are insufficient<textarea value={form.currentGap} onChange={e=>setForm({...form,currentGap:e.target.value})} placeholder="Explain the capability, timing, coverage, or production gap." disabled={!isCoordinator}/></label>
        <label className="wide">Consequence if not approved<textarea value={form.consequence} onChange={e=>setForm({...form,consequence:e.target.value})} placeholder="Describe the operational, customer, or life-safety consequence." disabled={!isCoordinator}/></label>
        <div className="wide request-submit-row"><small>Requesting an effect is preferred over naming a platform when multiple capabilities could satisfy the requirement.</small><button className="primary small" disabled={!isCoordinator||!form.need.trim()||!form.currentGap.trim()||!form.consequence.trim()}>Submit to State J3</button></div>
      </form>
    </section>

    <section className="panel request-status-panel">
      <div className="panel-head"><h3>State J3 Request Status</h3><span className="chip amber">{control.requests.filter(r=>r.status==='PENDING STATE J3').length} PENDING</span></div>
      {control.requests.length===0 ? <p className="empty-state">No additional asset requests submitted.</p> : <div className="request-list">{control.requests.map(req=><article key={req.id}>
        <div><strong>{req.quantity} × {req.requestType}</strong><span className="chip amber">{req.status}</span></div>
        <p>{req.need}</p><small>Required by {req.requiredBy} · Submitted {req.submittedAt}</small>
        <div className="request-rationale"><span><b>Current gap:</b> {req.currentGap}</span><span><b>Consequence:</b> {req.consequence}</span></div>
        {isCoordinator&&req.status==='DRAFT' ? <button className="mini-button secondary" onClick={()=>onCancelRequest(req.id)}>Cancel</button>:null}
      </article>)}</div>}
    </section>

    <section className="panel asset-history-panel">
      <div className="panel-head"><h3>Allocation History</h3><span className="chip slate">STATE DRIVEN</span></div>
      <div className="history-list">{control.history.slice().reverse().map(item=><div key={item.id}><span>{item.time}</span><strong>{item.actor}</strong><p>{item.action}</p></div>)}</div>
    </section>
  </div>
}
