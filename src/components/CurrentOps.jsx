import { ROLES } from '../data/roles.js'

const roleGuidance = {
  remote_sensing_coordinator: 'Review regional mission protection, allocation conflicts, and issues that require a decision before they affect tomorrow’s plan.',
  remote_sensing_manager: 'Manage current execution, mission risk, retasking, and notification to the Coordinator.',
  collection_manager: 'Track current collection against the approved requirement and identify gaps that must be corrected before OP 2.',
  upad_lno: 'Track incoming collections, production commitments, and current delivery risk without changing collection priority.',
}

export default function CurrentOps({ role, missionState, onToggleProtection, onNotifyCoordinator, onOpenTomorrow }) {
  const roleMeta = ROLES.find((item) => item.id === role)
  return <div className="period-workspace current-workspace">
    <section className="panel period-hero current-period-hero">
      <div>
        <span className="eyebrow">Current Operational Period</span>
        <h2>OP 1 Execution</h2>
        <p>{roleGuidance[role]}</p>
      </div>
      <div className="period-meta">
        <span className="chip red">ACTIVE</span>
        <strong>As of {missionState.asOf}</strong>
        <small>Local Incident Time — {missionState.localTimeLabel}</small>
      </div>
    </section>

    <section className="panel cross-period-banner">
      <div><span className="eyebrow">Current-to-Tomorrow Connection</span><h3>Today’s execution is shaping OP 2</h3></div>
      <p>{missionState.crossPeriodImpacts[0].impact}</p>
      <button className="ghost period-link" onClick={onOpenTomorrow}>Open Tomorrow’s Plan</button>
    </section>

    <section className="panel full period-table-panel">
      <div className="panel-head"><h3>Current Mission Execution</h3><span className="chip teal">{roleMeta?.name}</span></div>
      <div className="period-table">
        <div className="period-table-head"><span>Mission</span><span>Platform / Window</span><span>Objective</span><span>Status</span><span>Risk / Coordination</span><span>Role Action</span></div>
        {missionState.currentOps.missions.map((mission) => <div className="period-table-row" key={mission.id}>
          <span><strong>{mission.fire}</strong><small>{mission.id}</small></span>
          <span><strong>{mission.platform}</strong><small>{mission.window} Local</small></span>
          <span>{mission.objective}</span>
          <span><span className={`chip ${mission.status === 'active' ? 'teal' : mission.status === 'at_risk' ? 'red' : 'amber'}`}>{mission.status.replace('_',' ').toUpperCase()}</span>{mission.protected && <small className="protected-label">PROTECTED</small>}</span>
          <span><strong>{mission.risk}</strong><small>{mission.coordinatorNotified ? 'Coordinator notified' : 'Coordinator update pending'}</small></span>
          <span className="row-actions">
            {(role === 'remote_sensing_coordinator' || role === 'remote_sensing_manager') && <button className="mini-button" onClick={() => onToggleProtection(mission.id)}>{mission.protected ? 'Remove Protection' : 'Protect Mission'}</button>}
            {role !== 'remote_sensing_coordinator' && !mission.coordinatorNotified && <button className="mini-button secondary" onClick={() => onNotifyCoordinator(mission.id)}>Notify Coordinator</button>}
            {(role === 'collection_manager' || role === 'upad_lno') && <span className="permission-note">Coordinate / Read Only</span>}
          </span>
        </div>)}
      </div>
    </section>

    <div className="period-bottom-grid">
      <section className="panel"><div className="panel-head"><h3>Closing Decision Windows</h3><span className="chip red">LOCAL TIME</span></div><div className="deadline-list">{missionState.currentOps.deadlines.map((item)=><div key={item.id}><span>{item.label}</span><strong>{item.time}</strong></div>)}</div></section>
      <section className="panel"><div className="panel-head"><h3>OP 2 Consequences Already Forming</h3><span className="chip amber">CONNECTED</span></div><ul>{missionState.crossPeriodImpacts.map((item)=><li key={item.id}>{item.impact}</li>)}</ul></section>
    </div>
  </div>
}
