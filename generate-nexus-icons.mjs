import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const outputRoot = "nexus-rs-icons-v2";
const iconDirectory = join(outputRoot, "assets", "icons");
const spriteDirectory = join(outputRoot, "sprite");
const reactDirectory = join(outputRoot, "react");

const icons = {
  mission: `
    <path d="M12 3 19 7v8l-7 4-7-4V7l7-4Z"/>
    <path d="M8 9.5 12 12l4-2.5"/>
    <path d="M12 12v4"/>
    <circle cx="12" cy="3" r="1"/>
    <circle cx="5" cy="16" r="1"/>
    <circle cx="19" cy="16" r="1"/>
  `,

  "current-ops": `
    <rect x="3" y="4" width="18" height="14" rx="2"/>
    <path d="M3 8h18M8 18v2m8-2v2M6 20h12"/>
    <rect x="6" y="11" width="3" height="3"/>
    <path d="m12 14 2-2 2 1 2-3"/>
    <circle cx="18" cy="7" r=".75" fill="currentColor" stroke="none"/>
  `,

  "tomorrows-plan": `
    <rect x="3" y="4" width="18" height="16" rx="2"/>
    <path d="M3 8h18M7 3v3m10-3v3"/>
    <path d="M6 12h4m-4 4h3"/>
    <path d="m12 16 2-3 2 1 2-3"/>
    <path d="m17 10 2 1-1 2"/>
  `,

  "sync-matrix": `
    <circle cx="6" cy="6" r="2"/>
    <circle cx="18" cy="6" r="2"/>
    <circle cx="6" cy="18" r="2"/>
    <circle cx="18" cy="18" r="2"/>
    <circle cx="12" cy="12" r="2"/>
    <path d="m7.5 7.5 3 3m3 0 3-3m-9 9 3-3m3 0 3 3"/>
    <path d="M8 6h8M6 8v8m12-8v8M8 18h8"/>
  `,

  requirements: `
    <path d="M6 3h9l4 4v14H6V3Z"/>
    <path d="M15 3v5h4"/>
    <path d="m9 12 1.5 1.5L13 11"/>
    <path d="M15 12h2m-8 5 1.5 1.5L13 16"/>
    <path d="M15 17h2"/>
  `,

  platforms: `
    <path d="M12 3v6l8 4v2l-8-2v5l3 2v1l-3-1-3 1v-1l3-2v-5l-8 2v-2l8-4V3Z"/>
    <path d="M10 6h4"/>
  `,

  "upad-status": `
    <rect x="2" y="7" width="5" height="7" rx="1"/>
    <path d="m3 12 1.25-1.5L6 12"/>
    <circle cx="5.5" cy="9" r=".5" fill="currentColor" stroke="none"/>
    <path d="M8 10h2m-1-1 1 1-1 1"/>
    <circle cx="13" cy="10" r="2.5"/>
    <path d="M13 6.5v1M13 12.5v1M9.5 10h1m5 0h1M10.5 7.5l.75.75m3.5 3.5.75.75m0-5-.75.75m-3.5 3.5-.75.75"/>
    <path d="M16 10h2m-1-1 1 1-1 1"/>
    <rect x="18" y="6" width="4" height="9" rx="1"/>
    <path d="M19 8h2m-2 3h2m-2 2h1"/>
    <path d="M5 16h14"/>
  `,

  airspace: `
    <path d="M4 18a8 8 0 0 1 16 0"/>
    <path d="M7 18a5 5 0 0 1 10 0"/>
    <path d="M12 5v13M4 18h16"/>
    <path d="m8 9 4 3 4-3"/>
    <circle cx="12" cy="18" r="1"/>
  `,

  "intel-oversight": `
    <path d="M3 12s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5Z"/>
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 5V3m0 18v-2M5 12H3m18 0h-2"/>
    <path d="m17 17 3 3"/>
  `,

  deadlines: `
    <path d="m12 3 7 7-7 11-7-11 7-7Z"/>
    <path d="M12 7v5l3 2"/>
    <path d="M9 3h6M9 21h6"/>
  `,

  "decision-log": `
    <path d="M5 3h10l4 4v14H5V3Z"/>
    <path d="M15 3v5h4"/>
    <path d="M8 11h7M8 15h5"/>
    <path d="m14 18 1.5 1.5L19 17"/>
  `,

  notes: `
    <path d="M4 3h16v14l-4 4H4V3Z"/>
    <path d="M16 17v4M16 17h4"/>
    <path d="M8 8h8M8 12h6"/>
  `,

  menu: `
    <path d="M4 7h16M4 12h16M4 17h16"/>
  `,

  settings: `
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9 7 7m10 10 2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/>
    <circle cx="12" cy="12" r="7"/>
  `,

  notifications: `
    <path d="M6 16h12l-1.5-2V10a4.5 4.5 0 0 0-9 0v4L6 16Z"/>
    <path d="M10 19h4"/>
    <path d="M12 3V2"/>
  `,

  help: `
    <circle cx="12" cy="12" r="9"/>
    <path d="M9.75 9a2.5 2.5 0 1 1 3.5 2.3c-.8.35-1.25.9-1.25 1.7"/>
    <circle cx="12" cy="17" r=".75" fill="currentColor" stroke="none"/>
  `,

  history: `
    <path d="M4 8V4m0 0h4M4 4l3 3"/>
    <path d="M5.5 6.5A8 8 0 1 1 4 14"/>
    <path d="M12 7v5l3 2"/>
  `,

  advisor: `
    <circle cx="11" cy="8" r="3"/>
    <path d="M5 19c.7-4 2.7-6 6-6 2.4 0 4.2 1 5.2 3"/>
    <path d="m18 14 .8 1.7L21 16l-1.6 1.4.4 2.1-1.8-1-1.8 1 .4-2.1L15 16l2.2-.3L18 14Z"/>
  `,

  products: `
    <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/>
    <path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>
  `,

  "mission-board": `
    <rect x="3" y="4" width="18" height="16" rx="2"/>
    <path d="M3 9h18M9 9v11M15 9v11"/>
    <path d="M6 6h2m4 0h2m4 0h1"/>
    <path d="M5.5 13h1m4 2h2m4-2h2m-13 4h2m9 0h2"/>
  `,

  timeline: `
    <path d="M3 12h18"/>
    <circle cx="6" cy="12" r="2"/>
    <circle cx="12" cy="12" r="2"/>
    <circle cx="18" cy="12" r="2"/>
  `,

  "map-layers": `
    <path d="m12 3 9 5-9 5-9-5 9-5Z"/>
    <path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>
  `,

  zoom: `
    <circle cx="10" cy="10" r="6"/>
    <path d="m14.5 14.5 5 5M10 7v6M7 10h6"/>
  `,

  expand: `
    <path d="M9 4H4v5M15 4h5v5M9 20H4v-5m11 5h5v-5"/>
    <path d="m4 9 5-5m6 0 5 5M4 15l5 5m6 0 5-5"/>
  `,

  collapse: `
    <path d="M9 9H4V4M15 9h5V4M9 15H4v5m11-5h5v5"/>
    <path d="M4 4l5 5m6 0 5-5M4 20l5-5m6 0 5 5"/>
  `,

  search: `
    <circle cx="10.5" cy="10.5" r="6.5"/>
    <path d="m15.5 15.5 5 5"/>
  `,

  filter: `
    <path d="M3 4h18l-7 8v6l-4 2v-8L3 4Z"/>
  `,

  send: `
    <path d="m3 11 18-8-7 18-3-7-8-3Z"/>
    <path d="M11 14 21 3"/>
  `,

  submit: `
    <circle cx="12" cy="12" r="9"/>
    <path d="m8 12 2.5 2.5L16 9"/>
  `,

  refresh: `
    <path d="M20 7V3l-3 3"/>
    <path d="M19 6a8 8 0 0 0-13-1"/>
    <path d="M4 17v4l3-3"/>
    <path d="M5 18a8 8 0 0 0 13 1"/>
  `,

  download: `
    <path d="M12 3v12"/>
    <path d="m8 11 4 4 4-4"/>
    <path d="M4 17v4h16v-4"/>
  `,

  upload: `
    <path d="M12 15V3"/>
    <path d="m8 7 4-4 4 4"/>
    <path d="M4 17v4h16v-4"/>
  `,
};

const displayNames = {
  mission: "Mission",
  "current-ops": "Current Ops",
  "tomorrows-plan": "Tomorrow's Plan",
  "sync-matrix": "Sync Matrix",
  requirements: "Requirements",
  platforms: "Platforms",
  "upad-status": "UPAD Status",
  airspace: "Airspace",
  "intel-oversight": "Intelligence Oversight",
  deadlines: "Deadlines",
  "decision-log": "Decision Log",
  notes: "Notes",
  menu: "Menu",
  settings: "Settings",
  notifications: "Notifications",
  help: "Help",
  history: "History",
  advisor: "Advisor",
  products: "Products",
  "mission-board": "Mission Board",
  timeline: "Timeline",
  "map-layers": "Map Layers",
  zoom: "Zoom",
  expand: "Expand",
  collapse: "Collapse",
  search: "Search",
  filter: "Filter",
  send: "Send",
  submit: "Submit",
  refresh: "Refresh",
  download: "Download",
  upload: "Upload",
};

function cleanBody(body) {
  return body
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .join("\n  ");
}

function createSvg(name, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="${displayNames[name]}" role="img">
  ${cleanBody(body)}
</svg>
`;
}

function pascalCase(name) {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

await Promise.all([
  mkdir(iconDirectory, { recursive: true }),
  mkdir(spriteDirectory, { recursive: true }),
  mkdir(reactDirectory, { recursive: true }),
]);

for (const [name, body] of Object.entries(icons)) {
  await writeFile(join(iconDirectory, `${name}.svg`), createSvg(name, body));
}

const spriteSymbols = Object.entries(icons)
  .map(
    ([name, body]) => `  <symbol id="icon-${name}" viewBox="0 0 24 24">
    ${cleanBody(body)}
  </symbol>`,
  )
  .join("\n");

const sprite = `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display:none">
${spriteSymbols}
</svg>
`;

await writeFile(join(spriteDirectory, "nexus-rs-icons.svg"), sprite);

const reactExports = Object.keys(icons)
  .map(
    (name) =>
      `export { default as ${pascalCase(name)}Icon } from "../assets/icons/${name}.svg?react";`,
  )
  .join("\n");

await writeFile(join(reactDirectory, "index.ts"), `${reactExports}\n`);

const iconNames = Object.keys(icons)
  .map((name) => `  | "${name}"`)
  .join("\n");

await writeFile(
  join(reactDirectory, "types.ts"),
  `export type NexusIconName =\n${iconNames};\n`,
);

const readme = `# NEXUS RS Icon System V2.0

Official production icon package for the NEXUS RS Remote Sensing Simulation Platform.

## Contents

- \`assets/icons/\` — individual 24×24 SVG assets
- \`sprite/nexus-rs-icons.svg\` — SVG symbol sprite
- \`react/index.ts\` — React/Vite SVG component exports
- \`react/types.ts\` — TypeScript icon-name union

## Specifications

- Canvas: 24×24
- ViewBox: \`0 0 24 24\`
- Stroke width: 2px
- Stroke color: \`currentColor\`
- Stroke line cap: round
- Stroke line join: round
- Fill: none unless a small status point requires a solid fill
- Primary color: \`#7FE8F4\`
- White alternative: \`#FFFFFF\`

The SVGs contain editable vector geometry only. They contain no raster elements, fonts, filters, gradients, shadows, scripts, or editor metadata.

## Naming

File names use lowercase kebab case:

- \`mission.svg\`
- \`current-ops.svg\`
- \`tomorrows-plan.svg\`
- \`intel-oversight.svg\`
- \`map-layers.svg\`

React component exports use PascalCase with an \`Icon\` suffix:

- \`MissionIcon\`
- \`CurrentOpsIcon\`
- \`TomorrowsPlanIcon\`
- \`IntelOversightIcon\`

## Direct SVG usage

\`\`\`html
<img src="/assets/icons/mission.svg" width="24" height="24" alt="Mission">
\`\`\`

Using an SVG as an image does not allow CSS \`color\` to control \`currentColor\`. Use inline SVG, the sprite, or an SVG-to-React loader when dynamic coloring is required.

## React usage

The included barrel file uses the Vite/SVGR \`?react\` import convention.

\`\`\`tsx
import { MissionIcon } from "./react";

export function MissionNavigationItem() {
  return (
    <button className="navigationItem">
      <MissionIcon aria-hidden="true" />
      <span>Mission</span>
    </button>
  );
}
\`\`\`

Install SVGR for Vite when needed:

\`\`\`bash
npm install --save-dev vite-plugin-svgr
\`\`\`

Configure Vite:

\`\`\`ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [react(), svgr()],
});
\`\`\`

## Sprite usage

Load the sprite into the document, then reference a symbol:

\`\`\`html
<svg class="nexusIcon" aria-hidden="true">
  <use href="/sprite/nexus-rs-icons.svg#icon-mission"></use>
</svg>
\`\`\`

## Recommended sizing

Use the icons at 20px or 24px. The native design size is 24px.

\`\`\`css
.nexusIcon {
  width: 24px;
  height: 24px;
  display: block;
  flex: 0 0 auto;
  color: #7fe8f4;
}
\`\`\`

Avoid nonuniform scaling. Preserve the square aspect ratio.

## Interaction states

Interaction states should be applied by the containing UI component. Do not maintain separate SVG geometry for each state.

\`\`\`css
.iconControl {
  color: #7fe8f4;
  background: transparent;
}

.iconControl:hover {
  color: #a8f6ff;
}

.iconControl[aria-current="page"],
.iconControl[data-selected="true"] {
  color: #7fe8f4;
  background: #0e2a36;
}

.iconControl:disabled,
.iconControl[aria-disabled="true"] {
  color: #3a4c5c;
  opacity: 0.4;
}
\`\`\`

Suggested selected-state container:

\`\`\`css
.iconControl[data-selected="true"] {
  border-radius: 4px;
}
\`\`\`

## Accessibility

Decorative icons should use \`aria-hidden="true"\`. Interactive controls must receive an accessible name from their visible label or \`aria-label\`.

Do not rely on icon shape or color alone to communicate application status.

## Background compatibility

The icon family is optimized for:

- \`#081320\`
- \`#0F1A28\`
- \`#142535\`

## Version

NEXUS RS Icon System V2.0
`;

await writeFile(join(outputRoot, "README.md"), readme);

const packageJson = {
  name: "@nexus-rs/icons",
  version: "2.0.0",
  private: true,
  sideEffects: false,
  files: ["assets", "sprite", "react", "README.md"],
};

await writeFile(
  join(outputRoot, "package.json"),
  `${JSON.stringify(packageJson, null, 2)}\n`,
);

console.log(
  `Generated ${Object.keys(icons).length} icons in ${outputRoot}/`,
);