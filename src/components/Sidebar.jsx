import Icon from '../common/Icon.jsx'
import { ROLES } from '../data/roles.js'
import { canAccessWorkspace } from '../engine/exerciseController.js'

const ITEMS = [
  ['situation','Situation','map-layers'],
  ['current','Current Ops','current-ops'],
  ['tomorrow',"Tomorrow's Plan",'tomorrows-plan'],
  ['sync','Sync Matrix','sync-matrix'],
  ['requirements','Requirements','requirements'],
  ['platforms','Platforms','platforms'],
  ['upad','UPAD Status','upad-status'],
  ['airspace','Airspace','airspace'],
  ['oversight','Intelligence Oversight','intel-oversight'],
  ['updates','Deadlines','deadlines'],
  ['log','Decision Log','decision-log'],
]

const PORTAL_ITEMS = [['portal','Mission Portal'],['portal-resources','Resources'],['portal-help','Help & Support']]

export default function Sidebar({ active, setActive, role, missionState, portalMode = false }) {
  const selected = ROLES.find((item)=>item.id===role)
  const items = portalMode ? PORTAL_ITEMS : ITEMS
  return <aside className={`sidebar ${portalMode?'portal-sidebar':'live-sidebar'}`}>
    {portalMode
      ? <div className="brand"><div className="brand-mark">N</div><div><strong>NEXUS RS</strong><span>REMOTE SENSING OPERATIONS</span></div></div>
      : <div className="live-sidebar-brand"><img src="/images/brand/nexus-rs-header-logo.png" alt="NEXUS RS — Remote Sensing Simulation Platform"/></div>}
    <nav>{items.map(([id,label,icon]) => {
      const allowed = portalMode || id === 'situation' ? true : canAccessWorkspace(missionState || {}, id)
      return <button key={id} className={`${active===id?'active':''} ${!allowed?'restricted':''}`} onClick={()=>allowed && setActive(id)} title={!allowed?'Available after STARTEX or through exercise history.':''}>{icon && <Icon name={icon} size={22}/>}<span>{label}</span></button>
    })}</nav>
    {portalMode
      ? <div className="portal-sidebar-note"><span className="eyebrow">Pre-Exercise</span><p>Select a scenario and role, review readiness, then begin STARTEX.</p></div>
      : null}
    {portalMode && <div className="sidebar-foot"><strong>UNCLASSIFIED</strong><span>Local Incident Time</span></div>}
  </aside>
}
