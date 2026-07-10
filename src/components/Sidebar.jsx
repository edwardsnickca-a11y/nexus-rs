import { ROLES } from '../data/roles.js'
import { canAccessWorkspace } from '../engine/exerciseController.js'

const ITEMS = [
  ['portal','Mission Portal'],['brief','Scenario Brief'],['roles','Role Selection'],['mission','Mission'],['current','Current Ops'],['tomorrow',"Tomorrow's Plan"],['sync','Sync Matrix'],['requirements','Requirements'],['platforms','Platforms'],['upad','UPAD Status'],['airspace','Airspace'],['resources','Resource Desk'],['oversight','Intelligence Oversight'],['transition','OP Transition'],['updates','Mission Updates'],['aar','AAR'],['log','Decision Log']
]
const PORTAL_ITEMS = [['portal','Mission Portal'],['portal-resources','Resources'],['portal-help','Help & Support']]

export default function Sidebar({ active, setActive, role, missionState, portalMode = false }) {
  const selected = ROLES.find((item)=>item.id===role)
  const items = portalMode ? PORTAL_ITEMS : ITEMS
  return <aside className={`sidebar ${portalMode?'portal-sidebar':''}`}>
    <div className="brand"><div className="brand-mark">N</div><div><strong>NEXUS RS</strong><span>{portalMode?'REMOTE SENSING OPERATIONS':'MISSION WORKSPACE'}</span></div></div>
    <nav>{items.map(([id,label]) => {
      const allowed = portalMode ? true : canAccessWorkspace(missionState || {}, id)
      return <button key={id} className={`${active===id?'active':''} ${!allowed?'restricted':''}`} onClick={()=>allowed && setActive(id)} title={!allowed?'Available after STARTEX or through exercise history.':''}>{label}</button>
    })}</nav>
    {portalMode
      ? <div className="portal-sidebar-note"><span className="eyebrow">Pre-Exercise</span><p>Select a scenario and role, review readiness, then begin STARTEX.</p></div>
      : <div className="role-guide-card"><span className="eyebrow">Your Role</span><strong>{selected?.shortName || 'Not selected'}</strong><p>{selected?.emphasis || 'Select a role before STARTEX.'}</p><small>{selected?.authorityLabel || 'Role authority pending'}</small></div>}
    <div className="sidebar-foot"><strong>UNCLASSIFIED</strong><span>Local Incident Time</span></div>
  </aside>
}
