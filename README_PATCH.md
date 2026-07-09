# NEXUS RS Step 4A Patch

Adds the Asset Allocation, Release, Recall-Risk, and State J3 request workflow.

## Files changed
- src/App.jsx
- src/components/AssetAllocation.jsx
- src/data/missionState.js
- src/styles.css

## Key behavior
- STARTEX allocation: 1 MQ-9, 2 LUH-72, 2 CAP
- Coordinator-only release authority
- Additional/different capability requests routed to State J3
- Requests require operational need, current shortfall, consequence, quantity, and deadline
- Asset release changes current mission state and creates cross-period impacts
- Local incident time only
