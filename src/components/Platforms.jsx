import React, { useMemo, useState } from 'react'
import { PLATFORM_LIBRARY, evaluatePlatformSuitability } from '../data/platformLibrary.js'

const MATCH_LABELS = {
  suitable: 'SUITABLE',
  conditional: 'CONDITIONALLY SUITABLE',
  not_suitable: 'NOT SUITABLE',
  needs_information: 'NEEDS MORE INFORMATION',
}

function ArchitectureFlow({ architecture }) {
  const steps = [
    ['Collection', architecture.collection],
    ['Transfer', architecture.transfer],
    ['Processing', architecture.processing],
    ['Assessment', architecture.assessment],
    ['Dissemination', architecture.dissemination],
    ['Customer Receipt', architecture.customerReceipt],
  ]
  return <div className="pad-flow">
    {steps.map(([label, text], index) => <React.Fragment key={label}>
      <div className="pad-step"><span>{label}</span><p>{text}</p></div>
      {index < steps.length - 1 && <div className="pad-arrow">→</div>}
    </React.Fragment>)}
  </div>
}

export default function Assets({ role, missionState }) {
  const [selectedPlatformId, setSelectedPlatformId] = useState('platform-mq9')
  const [selectedRequirementId, setSelectedRequirementId] = useState('req-alpha')
  const selectedPlatform = PLATFORM_LIBRARY.find(item => item.id === selectedPlatformId) || PLATFORM_LIBRARY[0]
  const taskableRequirements = missionState.requirements.items.filter(req => ['taskable', 'sent_forward'].includes(req.status))
  const selectedRequirement = missionState.requirements.items.find(req => req.id === selectedRequirementId) || taskableRequirements[0]
  const match = useMemo(() => evaluatePlatformSuitability(selectedRequirement, selectedPlatform), [selectedRequirement, selectedPlatform])
  
  const regionalAssets = missionState.assetControl.assets.filter(asset => asset.status === 'assigned' || asset.status === 'reserve')

  const assetLabel = asset => asset.config ? `${asset.type} ${asset.config}` : asset.type
  const regionalCounts = {}
  regionalAssets.forEach(asset => {
    const label = assetLabel(asset)
    regionalCounts[label] = (regionalCounts[label] || 0) + 1
  })
  const regionalSummary = Object.entries(regionalCounts).map(([label, count]) => `${count}x ${label}`)

  const allocationByIncident = {}
  regionalAssets.filter(asset => asset.status === 'assigned').forEach(asset => {
    const fire = asset.assignment || 'Unassigned'
    if (!allocationByIncident[fire]) allocationByIncident[fire] = []
    allocationByIncident[fire].push(asset)
  })

  const reserveAssets = regionalAssets.filter(asset => asset.status === 'reserve')
  
  const roleFocus = {
    remote_sensing_coordinator: 'Regional availability, allocation gaps, state control, and capability shortfalls.',
    remote_sensing_manager: 'Execution limits, airspace, weather, mission risk, and PAD architecture.',
    collection_manager: 'Requirement-to-capability suitability and effect-based collection recommendations.',
    upad_lno: 'Data volume, product type, processing burden, delivery timing, and customer receipt.',
  }[role]

  return <div className="platform-workspace">
    <section className="panel platform-hero">
      <div>
        <span className="eyebrow">Controlled Capability Library</span>
        <h2>Assets and Capability Reference</h2>
        <p>View all approved platform capabilities, match validated requirements with effects, and see current regional allocation by incident.</p>
      </div>
      <div className="platform-role-focus"><span>ROLE EMPHASIS</span><strong>{roleFocus}</strong></div>
    </section>

    <section className="panel platform-selector-panel">
      <div className="panel-heading"><h3>All Approved Platforms</h3><span className="chip teal">CONTROLLED DATA</span></div>
      <div className="platform-card-grid">
        {PLATFORM_LIBRARY.map(platform => {
          const allocated = missionState.assetControl.assets.filter(asset => asset.platformId ? asset.platformId === platform.id : asset.type === platform.type)
          const isRegional = allocated.length > 0
          return <button key={platform.id} className={`platform-select-card ${selectedPlatform.id === platform.id ? 'selected' : ''}`} onClick={() => setSelectedPlatformId(platform.id)}>
            <div><strong>{platform.type}</strong><span>{isRegional ? `${allocated.length} ALLOCATED` : 'NOT IN REGION'}</span></div>
            <p>{platform.category}</p>
            {isRegional && <small>{allocated.filter(a => a.status === 'assigned').length} assigned · {allocated.filter(a => a.status === 'reserve').length} reserve</small>}
          </button>
        })}
      </div>
    </section>

    <section className="panel platform-profile">
      <div className="panel-heading"><div><span className="eyebrow">{selectedPlatform.type}</span><h3>{selectedPlatform.displayName}</h3></div><span className="chip slate">APPROVED FACTS</span></div>
      <div className="platform-profile-grid">
        <div><h4>Approved Capabilities</h4><ul>{selectedPlatform.approvedCapabilities.map(item => <li key={item}>{item}</li>)}</ul></div>
        <div><h4>Supported Effects</h4><ul>{selectedPlatform.supportedEffects.map(item => <li key={item}>{item}</li>)}</ul></div>
        <div><h4>Best-Fit Requirements</h4><ul>{selectedPlatform.bestFitRequirements.map(item => <li key={item}>{item}</li>)}</ul></div>
        <div><h4>Constraints</h4><ul>{selectedPlatform.constraints.map(item => <li key={item}>{item}</li>)}</ul></div>
      </div>
      <div className="platform-fact-strip">
        <div><span>Weather / Visibility</span><strong>{selectedPlatform.weatherConsiderations}</strong></div>
        <div><span>Airspace</span><strong>{selectedPlatform.airspaceConsiderations}</strong></div>
        <div><span>Availability</span><strong>{selectedPlatform.availabilityAssumption}</strong></div>
      </div>
    </section>

    <section className="panel suitability-panel">
      <div className="panel-heading"><h3>Requirement-to-Capability Match</h3><span className={`match-badge ${match.status}`}>{MATCH_LABELS[match.status]}</span></div>
      <label className="platform-select-label">Validated Requirement
        <select value={selectedRequirement?.id || ''} onChange={e => setSelectedRequirementId(e.target.value)}>
          {taskableRequirements.map(req => <option key={req.id} value={req.id}>{req.id} · {req.fire} · {req.title}</option>)}
        </select>
      </label>
      {selectedRequirement ? <>
        <div className="requirement-match-summary">
          <div><span>Decision to Support</span><strong>{selectedRequirement.decisionToSupport}</strong></div>
          <div><span>Required Effect</span><strong>{selectedRequirement.requiredEffect}</strong></div>
          <div><span>Decision Window</span><strong>{selectedRequirement.when}</strong></div>
        </div>
        <div className="match-reasons">{match.reasons.map(reason => <p key={reason}>• {reason}</p>)}</div>
      </> : <p className="empty-state">No taskable requirement is available for matching.</p>}
      <div className="match-guardrail">This is a reference tool to evaluate capability against requirements. Use this to identify if you need to request capabilities not currently allocated to the region.</div>
    </section>

    <section className="panel allocation-panel">
      <div className="panel-heading"><h3>Current Regional Allocation</h3></div>
      <div className="allocation-strip">
        <div className="allocation-strip-col">
          <strong className="allocation-strip-label allocation-strip-label-regional">Regional</strong>
          <div className="allocation-strip-body">{regionalSummary.join(' · ')}</div>
        </div>
        {Object.entries(allocationByIncident).map(([incident, assets]) =>
          <React.Fragment key={incident}>
            <div className="allocation-strip-divider" />
            <div className="allocation-strip-col">
              <strong className="allocation-strip-label">{incident}</strong>
              <div className="allocation-strip-body">
                {assets.map(asset => <div key={asset.id}>{assetLabel(asset)} · {asset.identifier}</div>)}
              </div>
            </div>
          </React.Fragment>
        )}
        <div className="allocation-strip-divider" />
        <div className="allocation-strip-col">
          <strong className="allocation-strip-label allocation-strip-label-regional">Reserves</strong>
          <div className="allocation-strip-body allocation-strip-body-muted">
            {reserveAssets.length
              ? reserveAssets.map(asset => <div key={asset.id}>{assetLabel(asset)} · {asset.identifier}</div>)
              : <div>None</div>}
          </div>
        </div>
      </div>
    </section>

    <section className="panel pad-panel full">
      <div className="panel-heading"><h3>Processing, Assessment, and Dissemination Architecture</h3><span className="chip teal">LOCAL MISSION CONTEXT</span></div>
      <ArchitectureFlow architecture={selectedPlatform.padArchitecture} />
      <div className="pad-bottom-grid">
        <div><span>Product Types</span><ul>{selectedPlatform.productTypes.map(item => <li key={item}>{item}</li>)}</ul></div>
        <div><span>Expected Delivery</span><p>{selectedPlatform.expectedDelivery}</p></div>
        <div><span>Production Burden</span><p>{selectedPlatform.productionBurden}</p></div>
      </div>
    </section>

    <section className="panel hard-limits-panel full">
      <div className="panel-heading"><h3>Hard Limits — Do Not Claim</h3><span className="chip red">GUARDRAILS</span></div>
      <ul>{selectedPlatform.hardLimits.map(item => <li key={item}>{item}</li>)}</ul>
    </section>
  </div>
}
