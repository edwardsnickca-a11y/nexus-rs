import { buildExerciseStatus } from '../engine/exerciseController.js'
import { getParticipantIdentity } from '../utils/participantIdentity.js'

export default function Header({ role, missionState, onReset, portalMode = false }) {
  const participant = getParticipantIdentity(missionState, role)
  const status = buildExerciseStatus(missionState || {})
  return <header className={`topbar ${portalMode?'portal-topbar':''}`}>
    <div>
      <span className="eyebrow">{portalMode?'NEXUS Remote Sensing':'Scenario'}</span>
      <h2>{portalMode?'Start Exercise':participant.primary}</h2>
    </div>
    {!portalMode && <div className="topmeta">
      <div><span>LOCAL TIME</span><strong>{status.localIncidentTime}</strong></div>
      <div><span>EXERCISE STATUS</span><strong className="active-text">{status.label}</strong></div>
      <div><span>USER / ROLE</span><strong>{participant.primary}</strong>{participant.secondary && <small>{participant.secondary}</small>}</div>
      <button className="ghost" onClick={onReset}>Reset Exercise</button>
    </div>}
  </header>
}
