import { ROLES } from '../data/roles.js'

const fires = [
  ['Fire Alpha', 'Pine Ridge', 'HIGH', 'Evacuation corridor and perimeter monitoring'],
  ['Fire Bravo', 'Canyon Creek', 'HIGH', 'Life-safety request under refinement'],
  ['Fire Charlie', 'Eagle Peak', 'MEDIUM', 'Coverage gap during afternoon window'],
]

const roleData = {
  remote_sensing_coordinator: {
    title: 'Regional Mission Integration',
    currentFocus: 'Balance protected current missions against emerging regional life-safety demand.',
    decisionWindow: 'Regional allocation decision due 1230 Local',
    tomorrowGaps: ['Fire Bravo requirement not yet taskable', 'Fire Charlie partner support unresolved', 'UPAD-NW production support unconfirmed'],
    primaryTitle: 'Regional Allocation & Protected Missions',
    primaryRows: [
      ['Fire Alpha', 'MQ-9-01', 'Protected', 'Maintain coverage'],
      ['Fire Bravo', 'LUH-72-01', 'At Risk', 'Life-safety review'],
      ['Fire Charlie', 'Partner Gap', 'Unmet', 'Coordinate BLM/USFS support'],
    ],
    secondaryTitle: 'Leadership Brief Readiness',
    secondaryRows: [
      ['What is flying?', '2 active / 1 planned'],
      ['What is uncovered?', 'Fire Charlie 1400–1700'],
      ['What needs decision?', 'Cross-incident allocation'],
      ['Matrix status', 'Coordinator approval pending'],
    ],
    editable: ['Regional priority', 'Protected status', 'Partner support path', 'Tomorrow-plan approval'],
    readonly: ['Analyst task assignment', 'Direct platform control during execution'],
  },
  remote_sensing_manager: {
    title: 'Mission Execution & Retasking',
    currentFocus: 'Execute approved missions while adapting to customer changes, airspace impacts, and life-safety demand.',
    decisionWindow: 'Fire Bravo retask recommendation due 1045 Local',
    tomorrowGaps: ['MQ-9 late-period coverage gap', 'LUH-72 airspace coordination pending', 'CAP availability begins after priority window'],
    primaryTitle: 'Platform Assignments & Availability',
    primaryRows: [
      ['MQ-9-01', 'On Station — Fire Alpha', 'ACTIVE', 'Next 1300'],
      ['LUH-72-01', 'Planned — Fire Bravo', 'AT RISK', 'Airspace pending'],
      ['CAP-01', 'Planned — Fire Charlie', 'PLANNED', 'Available 1600'],
    ],
    secondaryTitle: 'Execution Risks',
    secondaryRows: [
      ['Protected mission conflict', 'Fire Alpha / Fire Bravo'],
      ['Weather impact', 'Smoke layer increasing'],
      ['Airspace issue', 'Fire Bravo TFR update'],
      ['Coordinator notification', 'Required before retask'],
    ],
    editable: ['Current sortie window', 'Mission status', 'Retask record', 'Execution risk'],
    readonly: ['Regional allocation', 'Tomorrow-plan approval'],
  },
  collection_manager: {
    title: 'Requirements Development Workspace',
    currentFocus: 'Convert vague customer needs into taskable requirements with clear decisions, EEIs, cutoffs, and alternate sources.',
    decisionWindow: 'New requests cutoff 1600 Local',
    tomorrowGaps: ['Fire Bravo EEIs incomplete', 'Fire Charlie desired product unclear', 'Duplicate request review pending'],
    primaryTitle: 'Active Requirement Draft',
    primaryRows: [
      ['REQ-022', 'Fire Bravo change detection', 'DRAFT', 'Due 1630'],
      ['Decision to support', 'Protect evacuation decision', 'NEEDS REVIEW', 'Customer clarification'],
      ['EEIs', 'Perimeter / structures / route access', 'IN PROGRESS', '3 drafted'],
    ],
    secondaryTitle: 'Taskability & Alternate Sources',
    secondaryRows: [
      ['MQ-9', 'Good fit'],
      ['LUH-72', 'Moderate fit'],
      ['CAP', 'Limited fit for cutoff'],
      ['Partner source', 'Possible alternate coverage'],
    ],
    editable: ['Decision to support', 'Requirement language', 'EEIs', 'Taskability recommendation'],
    readonly: ['Aircraft retask', 'Regional approval', 'UPAD production priority'],
  },
  upad_lno: {
    title: 'UPAD Status & Production Overview',
    currentFocus: 'Deliver usable products on time while reporting realistic capacity, delays, releasability, and handoff risk.',
    decisionWindow: 'Fire Alpha product cutoff 1500 Local',
    tomorrowGaps: ['UPAD 2 at 92% workload', 'Two products projected simultaneously', 'Shift handoff plan incomplete'],
    primaryTitle: 'Production Workload',
    primaryRows: [
      ['UPAD 1', 'Fire Alpha IMINT', '86%', '1 overdue'],
      ['UPAD 2', 'Fire Bravo change detection', '92%', '2 at risk'],
      ['UPAD 3', 'Fire Charlie assessment', '78%', '1 pending'],
      ['UPAD 4', 'Reserve / fill-in', '22%', 'Available'],
    ],
    secondaryTitle: 'Delivery & Support Risk',
    secondaryRows: [
      ['Bandwidth', 'Limited'],
      ['Exploitation specialists', 'Tight'],
      ['Shift handoff', 'Not confirmed'],
      ['Support request', 'Additional bandwidth open'],
    ],
    editable: ['UPAD assignment', 'Production status', 'Delivery estimate', 'Capacity risk'],
    readonly: ['Aircraft retask', 'Collection priority', 'Regional allocation'],
  },
}

function StatusTable({ title, rows }) {
  return <section className="panel role-table-panel"><div className="panel-head"><h3>{title}</h3><span className="chip slate">ROLE VIEW</span></div><div className="role-table">{rows.map((row, idx)=><div className="role-table-row" key={`${row[0]}-${idx}`}>{row.map((cell, cellIdx)=><span key={cellIdx} className={cellIdx===0?'role-table-key':''}>{cell}</span>)}</div>)}</div></section>
}

export default function Overview({ role }) {
  const data = roleData[role] || roleData.remote_sensing_coordinator
  const roleMeta = ROLES.find((item)=>item.id===role)
  return <div className={`overview-grid role-overview role-${roleMeta?.accent || 'teal'}`}>
    <section className="panel current-op-card"><div className="panel-head"><h3>Current Operational Period (OP 1)</h3><span className="chip red">ACTIVE</span></div><p className="headline">{data.currentFocus}</p><div className="list"><div><span>Role Emphasis</span><strong>{data.title}</strong></div><div><span>Closing Window</span><strong>{data.decisionWindow}</strong></div></div></section>
    <section className="panel tomorrow-card"><div className="panel-head"><h3>Tomorrow's Plan (OP 2)</h3><span className="chip amber">NOT READY</span></div><div className="readiness"><span>Planning Readiness</span><strong>62%</strong></div><div className="progress"><div/></div><ul>{data.tomorrowGaps.map((item)=><li key={item}>{item}</li>)}</ul></section>
    <section className="panel deadlines-card"><div className="panel-head"><h3>Mission Deadlines & Windows</h3><span className="chip red">3 CLOSING</span></div><div className="deadline-list"><div><span>Fire Alpha Product</span><strong>1500</strong></div><div><span>Fire Bravo Decision</span><strong>1630</strong></div><div><span>Tomorrow Plan Submit</span><strong>1600</strong></div></div></section>

    <section className="panel regional-picture full"><div className="panel-head"><h3>Regional Mission Picture — Three Fires</h3><span className="chip teal">LOCAL INCIDENT TIME</span></div><div className="mission-map-shell"><div className="map-grid-lines"/><div className="map-zone north">NORTH ZONE</div><div className="map-zone central">CENTRAL ZONE</div><div className="map-zone south">SOUTH ZONE</div>{fires.map(([name,place,priority],idx)=><div key={name} className={`fire-marker fire-${idx+1}`}><span>◆</span><strong>{name}</strong><small>{place} · {priority}</small></div>)}<div className="asset-marker asset-a">✈ MQ-9</div><div className="asset-marker asset-b">✈ LUH-72</div><div className="asset-marker asset-c">✈ CAP</div></div></section>

    <StatusTable title={data.primaryTitle} rows={data.primaryRows}/>
    <StatusTable title={data.secondaryTitle} rows={data.secondaryRows}/>

    <section className="panel authority-panel full"><div className="panel-head"><div><span className="eyebrow">Role Authority</span><h3>{roleMeta?.authorityLabel}</h3></div><span className="chip teal">ENFORCED BY EVALUATOR</span></div><div className="authority-grid"><div><h4>Editable / In Authority</h4>{data.editable.map((item)=><span className="authority-item editable" key={item}>{item}</span>)}</div><div><h4>Read Only / Coordinate</h4>{data.readonly.map((item)=><span className="authority-item readonly" key={item}>{item}</span>)}</div></div></section>
  </div>
}
