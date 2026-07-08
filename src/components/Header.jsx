import { ROLES } from '../data/roles.js'
export default function Header({ role, onExit }) {
  const selected = ROLES.find((r)=>r.id===role)
  return <header className="topbar">
    <div><span className="eyebrow">Regional Multi-Fire Response</span><h2>{selected?.name}</h2></div>
    <div className="topmeta"><div><span>OPERATIONAL PERIOD</span><strong>1</strong></div><div><span>AS OF</span><strong>0930 PT</strong></div><div><span>STATUS</span><strong className="active-text">ACTIVE</strong></div><button className="ghost" onClick={onExit}>Exit</button></div>
  </header>
}
