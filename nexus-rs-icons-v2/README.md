# NEXUS RS Icon System V2.0

Official production icon package for the NEXUS RS Remote Sensing Simulation Platform.

## Contents

- `assets/icons/` — individual 24×24 SVG assets
- `sprite/nexus-rs-icons.svg` — SVG symbol sprite
- `react/index.ts` — React/Vite SVG component exports
- `react/types.ts` — TypeScript icon-name union

## Specifications

- Canvas: 24×24
- ViewBox: `0 0 24 24`
- Stroke width: 2px
- Stroke color: `currentColor`
- Stroke line cap: round
- Stroke line join: round
- Fill: none unless a small status point requires a solid fill
- Primary color: `#7FE8F4`
- White alternative: `#FFFFFF`

The SVGs contain editable vector geometry only. They contain no raster elements, fonts, filters, gradients, shadows, scripts, or editor metadata.

## Naming

File names use lowercase kebab case:

- `mission.svg`
- `current-ops.svg`
- `tomorrows-plan.svg`
- `intel-oversight.svg`
- `map-layers.svg`

React component exports use PascalCase with an `Icon` suffix:

- `MissionIcon`
- `CurrentOpsIcon`
- `TomorrowsPlanIcon`
- `IntelOversightIcon`

## Direct SVG usage

```html
<img src="/assets/icons/mission.svg" width="24" height="24" alt="Mission">
```

Using an SVG as an image does not allow CSS `color` to control `currentColor`. Use inline SVG, the sprite, or an SVG-to-React loader when dynamic coloring is required.

## React usage

The included barrel file uses the Vite/SVGR `?react` import convention.

```tsx
import { MissionIcon } from "./react";

export function MissionNavigationItem() {
  return (
    <button className="navigationItem">
      <MissionIcon aria-hidden="true" />
      <span>Mission</span>
    </button>
  );
}
```

Install SVGR for Vite when needed:

```bash
npm install --save-dev vite-plugin-svgr
```

Configure Vite:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [react(), svgr()],
});
```

## Sprite usage

Load the sprite into the document, then reference a symbol:

```html
<svg class="nexusIcon" aria-hidden="true">
  <use href="/sprite/nexus-rs-icons.svg#icon-mission"></use>
</svg>
```

## Recommended sizing

Use the icons at 20px or 24px. The native design size is 24px.

```css
.nexusIcon {
  width: 24px;
  height: 24px;
  display: block;
  flex: 0 0 auto;
  color: #7fe8f4;
}
```

Avoid nonuniform scaling. Preserve the square aspect ratio.

## Interaction states

Interaction states should be applied by the containing UI component. Do not maintain separate SVG geometry for each state.

```css
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
```

Suggested selected-state container:

```css
.iconControl[data-selected="true"] {
  border-radius: 4px;
}
```

## Accessibility

Decorative icons should use `aria-hidden="true"`. Interactive controls must receive an accessible name from their visible label or `aria-label`.

Do not rely on icon shape or color alone to communicate application status.

## Background compatibility

The icon family is optimized for:

- `#081320`
- `#0F1A28`
- `#142535`

## Version

NEXUS RS Icon System V2.0
