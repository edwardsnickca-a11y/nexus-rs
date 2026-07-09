import React, { useMemo, useState } from 'react'

const ROLE_TEXT = {
  remote_sensing_coordinator: 'Regional visibility: delivery risk, customer receipt, and unresolved dissemination gaps.',
  remote_sensing_manager: 'Execution visibility: collection completion, transfer status, and mission-to-product risk.',
  collection_manager: 'Requirement closure: verify the product answered the decision need and capture customer feedback.',
  upad_lno: 'Production authority: update processing, assessment, delivery, receipt verification, and customer feedback.',
}

const statusClass = (value='') => value.toLowerCase().replaceAll(' ','_')

export default function Dissemination({ role, missionState, onUpdateDelivery, onVerifyReceipt, onRecordFeedback }) {
  const deliveries = missionState.dissemination?.deliveries || []
  const [selectedId, setSelectedId] = useState(deliveries[0]?.id)
  const [feedback, setFeedback] = useState('')
  const selected = deliveries.find(d => d.id === selectedId) || deliveries[0]
  const canEdit = role === 'upad_lno'
  const canAssess = role === 'collection_manager' || role === 'upad_lno'

  const metrics = useMemo(() => ({
    total: deliveries.length,
    atRisk: deliveries.filter(d => d.deliveryStatus === 'at_risk').length,
    ready: deliveries.filter(d => d.deliveryStatus === 'ready_to_send').length,
    verified: deliveries.filter(d => d.receiptStatus === 'verified').length,
  }), [deliveries])

  if (!selected) return <section className="panel"><h3>Dissemination</h3><p>No deliveries are currently tracked.</p></section>

  const update = (changes) => onUpdateDelivery(selected.id, changes)
  const submitFeedback = () => {
    if (!feedback.trim()) return
    onRecordFeedback(selected.id, feedback.trim())
    setFeedback('')
  }

  return <div className="delivery-workspace">
    <section className="panel delivery-hero">
      <div><span className="eyebrow">PCPAD · Dissemination and Customer Closure</span><h2>Product Delivery and Verification</h2><p>Collection management is not complete until the customer can access the requested information, receipt is verified, and feedback is captured.</p></div>
      <div className="delivery-role-focus"><span>ROLE EMPHASIS</span><strong>{ROLE_TEXT[role]}</strong></div>
    </section>

    <section className="delivery-metrics">
      <div><span>Tracked Products</span><strong>{metrics.total}</strong></div>
      <div><span>At Risk</span><strong>{metrics.atRisk}</strong></div>
      <div><span>Ready to Send</span><strong>{metrics.ready}</strong></div>
      <div><span>Receipt Verified</span><strong>{metrics.verified}</strong></div>
    </section>

    <section className="panel delivery-queue">
      <div className="panel-heading"><h3>Delivery Queue</h3><span className="chip slate">LOCAL TIME</span></div>
      <div className="delivery-list">{deliveries.map(item => <button key={item.id} className={`delivery-card ${selected.id===item.id?'selected':''}`} onClick={()=>setSelectedId(item.id)}>
        <div><strong>{item.fire}</strong><span className={`delivery-status ${statusClass(item.deliveryStatus)}`}>{item.deliveryStatus.replaceAll('_',' ')}</span></div>
        <p>{item.productType}</p><small>{item.customer} · Due {item.deliveryDeadline}</small>
      </button>)}</div>
    </section>

    <section className="panel delivery-detail">
      <div className="panel-heading"><div><span className="eyebrow">{selected.requirementId}</span><h3>{selected.productType}</h3></div><span className={`delivery-status ${statusClass(selected.deliveryStatus)}`}>{selected.deliveryStatus.replaceAll('_',' ')}</span></div>
      <div className="delivery-detail-grid">
        <label>Customer<input value={selected.customer} disabled /></label>
        <label>Decision Need<textarea value={selected.customerNeed} disabled /></label>
        <label>Source Platform<input value={selected.sourcePlatform} disabled /></label>
        <label>Assigned UPAD<input value={selected.assignedUpad} onChange={e=>update({assignedUpad:e.target.value})} disabled={!canEdit} /></label>
        <label>Processing Status<select value={selected.processingStatus} onChange={e=>update({processingStatus:e.target.value})} disabled={!canEdit}><option value="not_started">Not Started</option><option value="awaiting_collection">Awaiting Collection</option><option value="in_progress">In Progress</option><option value="complete">Complete</option><option value="blocked">Blocked</option></select></label>
        <label>Assessment Status<select value={selected.assessmentStatus} onChange={e=>update({assessmentStatus:e.target.value})} disabled={!canEdit}><option value="not_started">Not Started</option><option value="in_progress">In Progress</option><option value="complete">Complete</option><option value="quality_review">Quality Review</option></select></label>
        <label>Delivery Deadline<input value={selected.deliveryDeadline} onChange={e=>update({deliveryDeadline:e.target.value})} disabled={!canEdit} /></label>
        <label>Estimated Delivery<input value={selected.estimatedDelivery} onChange={e=>update({estimatedDelivery:e.target.value})} disabled={!canEdit} /></label>
        <label className="wide">Dissemination Method<textarea value={selected.disseminationMethod} onChange={e=>update({disseminationMethod:e.target.value})} disabled={!canEdit} /></label>
        <label>Delivery Status<select value={selected.deliveryStatus} onChange={e=>update({deliveryStatus:e.target.value})} disabled={!canEdit}><option value="planned">Planned</option><option value="at_risk">At Risk</option><option value="ready_to_send">Ready to Send</option><option value="sent">Sent</option><option value="delivered">Delivered</option></select></label>
        <label>Receipt Status<input value={selected.receiptStatus.replaceAll('_',' ')} disabled /></label>
        <label className="wide">Notes<textarea value={selected.notes} onChange={e=>update({notes:e.target.value})} disabled={!canEdit} /></label>
      </div>
      <div className="delivery-actions">
        <button className="ghost-button" disabled={!canEdit || !['sent','delivered'].includes(selected.deliveryStatus)} onClick={()=>onVerifyReceipt(selected.id)}>Verify Customer Receipt</button>
      </div>
    </section>

    <section className="panel delivery-flow-panel">
      <div className="panel-heading"><h3>Mission-to-Customer Chain</h3><span className="chip teal">PCPAD</span></div>
      <div className="delivery-flow">
        {[
          ['Collection', selected.collectionComplete ? 'Complete' : 'Pending'],
          ['Transfer', selected.processingStatus==='not_started' ? 'Pending' : 'In Motion'],
          ['Processing', selected.processingStatus.replaceAll('_',' ')],
          ['Assessment', selected.assessmentStatus.replaceAll('_',' ')],
          ['Dissemination', selected.deliveryStatus.replaceAll('_',' ')],
          ['Customer Receipt', selected.receiptStatus.replaceAll('_',' ')],
        ].map(([label,value],i)=><React.Fragment key={label}><div className="delivery-flow-step"><span>{label}</span><strong>{value}</strong></div>{i<5&&<div className="delivery-flow-arrow">→</div>}</React.Fragment>)}
      </div>
    </section>

    <section className="panel feedback-panel">
      <div className="panel-heading"><h3>Customer Feedback</h3><span className="chip amber">CLOSE THE LOOP</span></div>
      <p>Did the customer receive the product, understand it, and get enough information to support the intended decision?</p>
      <textarea value={feedback} onChange={e=>setFeedback(e.target.value)} disabled={!canAssess} placeholder="Record customer feedback, remaining information gap, or recollection need..." />
      <div className="delivery-actions"><button className="primary-button small" disabled={!canAssess || !feedback.trim()} onClick={submitFeedback}>Record Feedback</button></div>
      <div className="feedback-history">{(missionState.dissemination?.feedback||[]).filter(f=>f.deliveryId===selected.id).map(f=><div key={f.id}><span>{f.time} · {f.actor}</span><p>{f.text}</p></div>)}</div>
    </section>
  </div>
}
