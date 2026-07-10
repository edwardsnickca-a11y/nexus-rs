import { ROLES } from '../data/roles.js'
import { canAccessWorkspace } from '../engine/exerciseController.js'

const ITEMS = [
  ['portal','Mission Portal'],['brief','Scenario Brief'],['roles','Role Selection'],['mission','Mission'],['current','Current Ops'],['tomorrow',"Tomorrow's Plan"],['sync','Sync Matrix'],['requirements','Requirements'],['platforms','Platforms'],['upad','UPAD Status'],['airspace','Airspace'],['resources','Resource Desk'],['oversight','Intelligence Oversight'],['transition','OP Transition'],['updates','Mission Updates'],['aar','AAR'],['log','Decision Log']
]
export default function Sidebar({ active, setActive, role, missionState }) {
  const selected = ROLES.find((item)=>item.id===role)
  return <aside className="sidebar">
    <div className="brand"><div className="brand-mark">N</div><div><strong>NEXUS RS</strong><span>MISSION WORKSPACE</span></div></div>
    <nav>{ITEMS.map(([id,label]) => {
      const allowed = canAccessWorkspace(missionState || {}, id)
      return <button key={id} className={`${active===id?'active':''} ${!allowed?'restricted':''}`} onClick={()=>allowed && setActive(id)} title={!allowed?'Available after STARTEX or through exercise history.':''}>{label}</button>
    })}</nav>
    <div className="role-guide-card"><span className="eyebrow">Your Role</span><strong>{selected?.shortName || 'Not selected'}</strong><p>{selected?.emphasis || 'Select a role before STARTEX.'}</p><small>{selected?.authorityLabel || 'Role authority pending'}</small></div>
    <div className="sidebar-foot"><strong>UNCLASSIFIED</strong><span>Local Incident Time</span></div>
  </aside>
}
