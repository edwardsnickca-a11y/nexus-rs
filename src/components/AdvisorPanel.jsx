import { useState } from 'react'

const BRIEFS = {
  remote_sensing_coordinator: 'Your Sync Matrix shows a three-hour gap over Fire Charlie. A BLM partner asset may be available nearby. Resolve the unmet need and brief me on the revised regional plan before 1230 Local.',
  remote_sensing_manager: 'The current plan protects Fire Alpha, but the Fire Bravo request may carry a life-safety nexus. Prepare the mission impact and send your recommendation to the Coordinator.',
  collection_manager: 'Fire Bravo has an asset placeholder, but the supporting requirement is not yet taskable. Refine the EEIs and send the recommendation forward.',
  upad_lno: 'Two products are projected to arrive at the same time. Report which delivery is at risk and pass the production impact to the RS Manager.',
}
export default function AdvisorPanel({ role, onSubmitDecision }) {
  const [text,setText]=useState('')
  const submit=()=>{ if(!text.trim()) return; onSubmitDecision(text.trim()); setText('') }
  return <section className="panel advisor"><div className="panel-head"><div><span className="eyebrow">Senior Remote Sensing Mission Advisor</span><h3>Lt Col Edwards</h3></div><span className="live">LIVE</span></div><p>{BRIEFS[role]}</p><textarea value={text} onChange={(e)=>setText(e.target.value)} placeholder="Enter your decision or update..."/><div className="advisor-actions"><span>Exact text preserved in decision record</span><button className="primary small" onClick={submit} disabled={!text.trim()}>Submit Decision</button></div></section>
}
