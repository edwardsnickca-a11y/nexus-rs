import React from 'react'

export default function ScenarioBrief({ missionState, onContinue }) {
  const assets = missionState.assetControl?.assets || []
  const requirements = missionState.requirements?.items || []
  return <div className="lifecycle-shell">
    <section className="panel aar-hero">
      <div>
        <span className="eyebrow">Scenario Brief</span>
        <h2>Regional Multi-Fire Response</h2>
        <p>This brief establishes the initial mission picture only. It does not reveal future injects or recommend decisions.</p>
      </div>
      <button className="primary small" onClick={onContinue}>Continue to Role Selection</button>
    </section>

    <section className="portal-grid">
      <article className="panel"><span className="eyebrow">Incident Summary</span><p className="headline">Multiple simultaneous wildfire incidents are competing for limited remote-sensing collection, production, assessment, and dissemination capacity.</p></article>
      <article className="panel"><span className="eyebrow">Area of Operations</span><p className="headline">Regional wildfire incident area with Fire Alpha, Fire Bravo, and Fire Charlie workstreams already visible in mission state.</p></article>
      <article className="panel"><span className="eyebrow">Primary Operational Problem</span><p className="headline">Convert customer needs into taskable, authority-compliant collection and verified delivery while protecting higher-priority missions.</p></article>
      <article className="panel"><span className="eyebrow">Known Constraints</span><ul><li>State J3 controls state asset allocation and recall.</li><li>Some requirements are incomplete.</li><li>UPAD capacity and dissemination verification affect closure.</li><li>Local incident time only.</li></ul></article>
      <article className="panel"><span className="eyebrow">Initial Customer Needs</span><div className="compact-list">{requirements.map((req)=><div key={req.id}><strong>{req.title}</strong><span>{req.customer} · {req.status}</span></div>)}</div></article>
      <article className="panel"><span className="eyebrow">Initial Allocated Assets</span><div className="compact-list">{assets.map((asset)=><div key={asset.id}><strong>{asset.identifier}</strong><span>{asset.assignment} · {asset.recallRisk} recall risk</span></div>)}</div></article>
      <article className="panel"><span className="eyebrow">Partner Agencies</span><p className="headline">County Emergency Management, Fire Bravo ICP, State EOC, State J3, partner imagery providers, and UPAD elements.</p></article>
      <article className="panel"><span className="eyebrow">Exercise Objective</span><p className="headline">Run the remote-sensing mission lifecycle from STARTEX to ENDEX without overrunning role authority or treating collection as complete before receipt verification.</p></article>
    </section>
  </div>
}
