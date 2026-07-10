import { ROLES } from '../data/roles.js'
import { buildExerciseStatus } from '../engine/exerciseController.js'

export default function Header({ role, missionState, onReset, portalMode = false }) {
  const selected = ROLES.find((r)=>r.id===role)
  const status = buildExerciseStatus(missionState || {})
  return <header className={`topbar ${portalMode?'portal-topbar':''}`}>
    <div>
      <span className="eyebrow">{portalMode?'NEXUS Remote Sensing':'Scenario'}</span>
      <h2>{portalMode?'Mission Portal':(selected?.name || 'Role not selected')}</h2>
    </div>
    <div className="topmeta">
      <div><span>LOCAL TIME</span><strong>{status.localIncidentTime}</strong></div>
      <div><span>EXERCISE STATUS</span><strong className="active-text">{status.label}</strong></div>
      <div><span>USER / ROLE</span><strong>{selected?.shortName || 'Role not selected'}</strong></div>
      {!portalMode && <button className="ghost" onClick={onReset}>Reset Exercise</button>}
    </div>
  </header>
}
