import { useMemo, useState } from 'react'

export default function OperationalTransition({ role, missionState, onTransition }) {
  const [confirmed, setConfirmed] = useState(false)
  const carryForward = useMemo(() => ({
    unresolvedRequirements: missionState.requirements.items.filter((item)=>!['sent_forward','closed'].includes(item.status)),
    incompleteProducts: missionState.dissemination.deliveries.filter((item)=>item.receiptStatus !== 'verified'),
    activeOversight: missionState.oversight.cases.filter((item)=>item.status !== 'resolved'),
    assetRequests: missionState.assetControl.requests.filter((item)=>!['APPROVED','DENIED','CANCELLED'].includes(item.status)),
    protectedMissions: missionState.currentOps.missions.filter((item)=>item.protected),
    openImpacts: missionState.crossPeriodImpacts || [],
  }), [missionState])
  const totalCarry = Object.values(carryForward).reduce((sum, items)=>sum+items.length,0)
  const canTransition = role === 'remote_sensing_coordinator' && missionState.tomorrowPlan.approved

  return <div className="transition-layout">
    <section className="panel transition-hero">
      <div className="panel-head">
        <div><span className="eyebrow">Operational Period Control</span><h3>Transition OP {missionState.operationalPeriod} → OP {missionState.operationalPeriod + 1}</h3></div>
        <span className={`chip ${canTransition?'teal':'amber'}`}>{canTransition?'READY FOR COORDINATOR':'NOT READY'}</span>
      </div>
      <p className="headline">Tomorrow’s-plan decisions become operational commitments. Unresolved requirements, incomplete products, oversight concerns, protected missions, and partner commitments must carry forward without resetting the scenario.</p>
      <div className="transition-gates">
        <div className={missionState.tomorrowPlan.approved?'gate-pass':'gate-fail'}><span>Tomorrow Plan</span><strong>{missionState.tomorrowPlan.approved?'APPROVED':'APPROVAL REQUIRED'}</strong></div>
        <div className={role==='remote_sensing_coordinator'?'gate-pass':'gate-fail'}><span>Transition Authority</span><strong>{role==='remote_sensing_coordinator'?'RS COORDINATOR':'COORDINATOR REQUIRED'}</strong></div>
        <div><span>Carry-Forward Items</span><strong>{totalCarry}</strong></div>
        <div><span>Current Local As Of</span><strong>{missionState.asOf}</strong></div>
      </div>
    </section>

    <section className="transition-grid">
      <CarryCard title="Unresolved Requirements" items={carryForward.unresolvedRequirements} render={(item)=><><strong>{item.id} · {item.fire}</strong><span>{item.status}</span><p>{item.title}</p></>} />
      <CarryCard title="Incomplete Products" items={carryForward.incompleteProducts} render={(item)=><><strong>{item.id} · {item.fire}</strong><span>{item.deliveryStatus}</span><p>{item.productType}</p></>} />
      <CarryCard title="Oversight Concerns" items={carryForward.activeOversight} render={(item)=><><strong>{item.id}</strong><span>{item.status} · {item.deadline}</span><p>{item.title}</p></>} />
      <CarryCard title="Protected Missions" items={carryForward.protectedMissions} render={(item)=><><strong>{item.id} · {item.fire}</strong><span>{item.status}</span><p>{item.objective}</p></>} />
      <CarryCard title="Pending State J3 Requests" items={carryForward.assetRequests} render={(item)=><><strong>{item.quantity} × {item.requestType}</strong><span>{item.status}</span><p>{item.operationalNeed}</p></>} />
      <CarryCard title="Cross-Period Consequences" items={carryForward.openImpacts} render={(item)=><><strong>{item.source} → {item.target}</strong><p>{item.impact}</p></>} />
    </section>

    <section className="panel transition-action-panel">
      <div>
        <span className="eyebrow">Coordinator Certification</span>
        <h3>Commit OP {missionState.operationalPeriod + 1}</h3>
        <p>The transition will preserve unresolved mission state, convert the approved tomorrow plan into Current Ops, increment the operational period, and create a structured transition record.</p>
      </div>
      <label className="confirmation-check"><input type="checkbox" checked={confirmed} onChange={(event)=>setConfirmed(event.target.checked)} /> I have reviewed the carry-forward items and understand the operational commitments.</label>
      <button className="primary" disabled={!canTransition || !confirmed} onClick={onTransition}>Transition to Operational Period {missionState.operationalPeriod + 1}</button>
      {!missionState.tomorrowPlan.approved && <small className="warning-copy">The Remote Sensing Coordinator must approve Tomorrow’s Plan before transition.</small>}
    </section>
  </div>
}

function CarryCard({ title, items, render }) {
  return <article className="panel carry-card"><div className="panel-head"><h3>{title}</h3><span className={`chip ${items.length?'amber':'teal'}`}>{items.length}</span></div>{items.length?<div className="carry-list">{items.map((item,index)=><div className="carry-item" key={item.id || `${title}-${index}`}>{render(item)}</div>)}</div>:<p className="empty-copy">No items to carry forward.</p>}</article>
}
