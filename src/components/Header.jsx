import { ROLES } from '../data/roles.js'
import { buildExerciseStatus } from '../engine/exerciseController.js'

export default function Header({ role, missionState, onReset }) {
  const selected = ROLES.find((r)=>r.id===role)
  const status = buildExerciseStatus(missionState || {})
  return <header className="topbar">
    <div><span className="eyebrow">{status.scenarioName}</span><h2>{selected?.name || 'Role not selected'}</h2></div>
    <div className="topmeta">
      <div><span>OPERATIONAL PERIOD</span><strong>{status.activeOperationalPeriod || '—'}</strong></div>
      <div><span>AS OF</span><strong>{status.localIncidentTime}</strong></div>
      <div><span>STATUS</span><strong className="active-text">{status.label}</strong></div>
      <button className="ghost" onClick={onReset}>Reset Exercise</button>
    </div>
  </header>
}
