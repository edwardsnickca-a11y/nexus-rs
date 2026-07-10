# NEXUS RS — Patches 10 and 11

## Patch 10 summary
Adds a deterministic cross-module integration engine using stable requirement, mission, asset, product, feedback, oversight, and decision identifiers. It derives operational summaries, role-relevant alerts, Sync Matrix rows, requirement outcomes, and traceable AAR evidence. Collection completion activates PAD work but does not close the requirement. Customer receipt and recorded feedback affect closure.

## Patch 11 summary
Adds a server-side Vercel Anthropic route for Lt Col Edwards, a compact controlled-context builder, strict structured-response validation, an allowlisted proposed-action model, explicit trainee confirmation, bounded advisor history, prompt-injection guardrails, and the existing deterministic advisor as a local fallback.

## Architecture overview
The React mission state remains the authoritative source of truth. `integrationEngine.js` owns deterministic linked selectors and controlled actions. Anthropic receives a compact role-relevant context and may only return advisory structured JSON. The browser validates entity references and action names. Confirmed proposals are passed to deterministic application actions; Anthropic never mutates state directly.

## Files changed
- `api/advisor.js`
- `src/App.jsx`
- `src/components/AdvisorPanel.jsx`
- `src/data/missionState.js`
- `src/engine/aarEngine.js`
- `src/engine/integrationEngine.js`
- `src/engine/advisorPromptBuilder.js`
- `src/engine/advisorResponseValidator.js`
- `src/services/advisorApi.js`
- `src/styles.css`
- `README_PATCH.md`

## Installation path
`C:\Dev\nexus-rs`

## Replacement instructions
Extract this ZIP into the repository root and allow matching files to be replaced. The archive contains only changed or new files.

## npm install requirements
No new client or server package is required. The server route uses the Node/Vercel `fetch` runtime.

## Vercel environment variables
In Vercel Project Settings → Environment Variables, add:
- `ANTHROPIC_API_KEY` — required for Connected mode.
- `ANTHROPIC_MODEL` — optional; defaults to `claude-3-5-haiku-latest`.
- `ANTHROPIC_MAX_TOKENS` — optional; defaults to `900` and is capped by the route.

Apply variables to the Preview environment and redeploy. Never use a `VITE_` prefix for the API key.

## Local fallback behavior
When the key is absent, the request times out, the provider rate-limits, or structured validation fails, the existing deterministic mission advisor responds and the exercise continues. The panel displays `Advisor mode: Local fallback`.

## Build verification result
`npm run build` completed successfully in the supplied project.

## Known limitations
- The integration layer preserves the existing application architecture; several older workspace controls still use their original handlers rather than every new integration action.
- The default Anthropic model may need to be overridden if it is unavailable for the configured account.
- Vite development alone does not execute `/api/advisor`; use Vercel development or deployment to test Connected mode.
- AI-proposed actions outside the current deterministic action allowlist remain advisory and are not executed.

## Manual test checklist
- Validate a requirement and confirm it cannot be assigned while `needs_clarification`.
- Confirm initial missions carry stable `requirementId`, `assetId`, and product links.
- Verify customer receipt and confirm the linked requirement outcome can close only after assessed delivery.
- Record feedback containing a remaining gap and confirm recollection remains open.
- Submit “Launch the MQ-9…” as Collection Manager; confirm authority is flagged and no mission launches.
- Submit a product-priority request as UPAD LNO; confirm the interpreted action card appears before state change.
- Remove `ANTHROPIC_API_KEY`; confirm Local fallback works without a crash.
- Configure the key in Vercel Preview; confirm Connected mode appears.
- Test malformed/unknown entity output; confirm fallback and no state mutation.
- Run `npm run build`.

## Security notes
The API key is read only by `api/advisor.js`. Provider headers, raw errors, prompts, future injects, and secrets are not returned to the client. Trainee text is treated as untrusted. Responses must reference existing IDs and use an allowlisted action.

## Rollback notes
Restore the listed files from the prior commit and remove the four new integration/advisor files plus `api/advisor.js`. No migration or external data rollback is required.
