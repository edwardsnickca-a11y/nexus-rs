import { ROLES } from '../data/roles.js'

const roleGuidance = {
  remote_sensing_coordinator: 'Resolve regional trade-offs, protect critical missions, and approve the plan when requirements, collection, production, and airspace are defensible.',
  remote_sensing_manager: 'Build an executable platform plan, identify mission risk, and send the recommendation to the Coordinator.',
  collection_manager: 'Make requirements taskable with clear decisions, EEIs, cutoffs, and alternate-source options.',
  upad_lno: 'Confirm production support, realistic delivery estimates, workload risk, and shift handoff.',
}

export default function TomorrowPlan({ role, missionState, onMarkTaskable, onAssignUpad, onApprovePlan, onOpenCurrent }) {
  const roleMeta = ROLES.find((item) => item.id === role)
  const canApprove = role === 'remote_sensing_coordinator'
  const canTask = role === 'collection_manager'
  const canAssignUpad = role === 'upad_lno'
  return <div className="period-workspace tomorrow-workspace">
    <section className="panel period-hero tomorrow-period-hero">
      <div><span className="eyebrow">Tomorrow’s Plan</span><h2>OP 2 Planning</h2><p>{roleGuidance[role]}</p></div>
      <div className="period-meta"><span className={`chip ${missionState.tomorrowPlan.approved ? 'teal' : 'amber'}`}>{missionState.tomorrowPlan.approved ? 'APPROVED' : 'NOT READY'}</span><strong>{missionState.tomorrowPlan.readiness}% Ready</strong><small>Planning deadline: {missionState.tomorrowPlan.planningDeadline}</small></div>
    </section>

    <section className="panel cross-period-banner tomorrow-impact">
      <div><span className="eyebrow">Tomorrow-to-Current Connection</span><h3>Planning gaps are already affecting execution</h3></div>
      <p>{missionState.crossPeriodImpacts[1].impact}</p>
      <button className="ghost period-link" onClick={onOpenCurrent}>Review Current Ops</button>
    </section>

    <section className="panel full planning-board">
      <div className="panel-head"><div><h3>OP 2 Requirement and Mission Queue</h3><span className="board-subtitle">Requirement → Collection → Production → Approval</span></div><span className="chip teal">{roleMeta?.name}</span></div>
      <div className="planning-columns">
        {missionState.tomorrowPlan.requirements.map((req)=><article className={`planning-card status-${req.status}`} key={req.id}>
          <div className="planning-card-head"><div><span className="eyebrow">{req.id}</span><h3>{req.fire}</h3></div><span className={`chip ${req.status === 'ready' ? 'teal' : req.status === 'draft' ? 'amber' : 'red'}`}>{req.status.toUpperCase()}</span></div>
          <p>{req.title}</p>
          <div className="planning-detail"><span>Taskability</span><strong>{req.taskable ? 'Taskable' : 'Not Taskable'}</strong></div>
          <div className="planning-detail"><span>Platform</span><strong>{req.platform}</strong></div>
          <div className="planning-detail"><span>Production</span><strong>{req.upad}</strong></div>
          <div className="planning-actions">
            {canTask && !req.taskable && <button className="mini-button" onClick={()=>onMarkTaskable(req.id)}>Mark Taskable</button>}
            {canAssignUpad && req.upad === 'Unassigned' && <button className="mini-button" onClick={()=>onAssignUpad(req.id)}>Assign UPAD</button>}
            {!canTask && !canAssignUpad && <span className="permission-note">{canApprove ? 'Review / Approve' : 'Recommend / Coordinate'}</span>}
          </div>
        </article>)}
      </div>
    </section>

    <div className="period-bottom-grid planning-bottom-grid">
      <section className="panel"><div className="panel-head"><h3>Blocking Issues</h3><span className="chip red">{missionState.tomorrowPlan.blockers.length} OPEN</span></div><ul>{missionState.tomorrowPlan.blockers.map((item)=><li key={item}>{item}</li>)}</ul></section>
      <section className="panel approval-panel"><div className="panel-head"><h3>Publication Readiness</h3><span className="chip amber">Coordinator Approval</span></div><div className="readiness"><span>Plan Readiness</span><strong>{missionState.tomorrowPlan.readiness}%</strong></div><div className="progress dynamic-progress"><div style={{width:`${missionState.tomorrowPlan.readiness}%`}}/></div><p>Publication deadline: <strong>{missionState.tomorrowPlan.publicationDeadline}</strong></p>{canApprove ? <button className="primary small" onClick={onApprovePlan} disabled={missionState.tomorrowPlan.approved}>{missionState.tomorrowPlan.approved ? 'Plan Approved' : 'Approve Tomorrow Plan'}</button> : <span className="permission-note">Coordinator approval required</span>}</section>
    </div>
  </div>
}
