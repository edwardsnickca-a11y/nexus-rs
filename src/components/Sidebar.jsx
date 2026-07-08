const ITEMS = [
  ['mission','Mission'],['current','Current Ops'],['tomorrow',"Tomorrow's Plan"],['sync','Sync Matrix'],['requirements','Requirements'],['platforms','Platforms'],['upad','UPAD Status'],['airspace','Airspace'],['oversight','Intelligence Oversight'],['deadlines','Deadlines'],['log','Decision Log']
]
export default function Sidebar({ active, setActive }) {
  return <aside className="sidebar">
    <div className="brand"><div className="brand-mark">N</div><div><strong>NEXUS RS</strong><span>MISSION WORKSPACE</span></div></div>
    <nav>{ITEMS.map(([id,label]) => <button key={id} className={active===id?'active':''} onClick={()=>setActive(id)}>{label}</button>)}</nav>
    <div className="sidebar-foot"><strong>UNCLASSIFIED</strong><span>Local Incident Time</span></div>
  </aside>
}
