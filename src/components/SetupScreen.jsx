import { ROLES } from '../data/roles.js'

export default function SetupScreen({ role, setRole, onStart }) {
  return (
    <div className="setup-shell">
      <div className="setup-card">
        <div className="eyebrow">NEXUS RS v0.1</div>
        <h1>Remote Sensing Mission Management Simulator</h1>
        <p className="lead">Train judgment across competing fires, limited collection capacity, multiple UPADs, airspace constraints, and simultaneous current operations and next-period planning.</p>
        <div className="role-grid">
          {ROLES.map((item) => (
            <button key={item.id} className={`role-card ${role === item.id ? 'selected' : ''}`} onClick={() => setRole(item.id)}>
              <strong>{item.name}</strong>
              <span>{item.emphasis}</span>
            </button>
          ))}
        </div>
        <div className="summary-row">
          <div><span>Scenario</span><strong>Regional Multi-Fire Response</strong></div>
          <div><span>Operational Periods</span><strong>2</strong></div>
          <div><span>Time Standard</span><strong>Local Incident Time Only</strong></div>
        </div>
        <button className="primary" onClick={onStart}>Enter Mission Workspace</button>
      </div>
    </div>
  )
}
