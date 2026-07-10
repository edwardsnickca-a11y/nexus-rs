import React, { useState } from 'react'
import { collectUnresolvedForEndex } from '../engine/exerciseController.js'

function CountLine({ label, items }) {
  return <div className="detail-row"><span>{label}</span><strong>{items.length}</strong></div>
}

export default function EndExModal({ missionState, onCancel, onConfirm }) {
  const [reason, setReason] = useState('Controller-directed ENDEX.')
  const unresolved = collectUnresolvedForEndex(missionState)

  return <div className="modal-backdrop" role="dialog" aria-modal="true">
    <section className="panel endex-modal">
      <div className="panel-head"><div><span className="eyebrow">ENDEX Confirmation</span><h3>End exercise with unresolved items recorded</h3></div></div>
      <p className="headline">ENDEX does not force closure. Open requirements, incomplete products, unverified dissemination, pending State J3 requests, and oversight cases will remain visible in the final AAR.</p>
      <CountLine label="Open requirements" items={unresolved.openRequirements} />
      <CountLine label="Incomplete products" items={unresolved.incompleteProducts} />
      <CountLine label="Unverified dissemination" items={unresolved.unverifiedDissemination} />
      <CountLine label="Pending State J3 requests" items={unresolved.pendingStateJ3} />
      <CountLine label="Open oversight cases" items={unresolved.openOversight} />
      <label className="form-field"><span>ENDEX reason</span><textarea value={reason} onChange={(event)=>setReason(event.target.value)} /></label>
      <div className="modal-actions">
        <button className="ghost" onClick={onCancel}>Cancel</button>
        <button className="primary" onClick={()=>onConfirm(reason)}>Confirm ENDEX</button>
      </div>
    </section>
  </div>
}
