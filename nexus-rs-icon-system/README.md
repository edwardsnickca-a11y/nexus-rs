# NEXUS RS Icon System

A custom 24 px technical icon family for remote-sensing mission management,
ISR operations, intelligence workflows, and command coordination.

## Contents

- `svg/navigation`: navigation SVG files
- `svg/utilities`: utility SVG files
- `sprite/nexus-rs-icons.svg`: SVG sprite
- `react`: React and TypeScript components
- `tokens`: JSON and CSS design tokens
- `manifest`: naming and asset manifest
- `preview/index.html`: contact sheet
- `docs`: style guide and Figma assembly guidance

## React usage

```tsx
import {
  MissionIcon,
  SearchIcon,
  Icon,
} from "./nexus-rs-icon-system/react";

export function Example() {
  return (
    <>
      <MissionIcon size={24} color="#7FE8F4" />
      <SearchIcon size={24} color="#FFFFFF" />

      <Icon
        name="current-ops"
        state="selected"
        title="Current operations"
      />
    </>
  );
}
```

## Sprite usage

```html
<svg
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="#7FE8F4"
  stroke-width="1.5"
>
  <use href="/icons/nexus-rs-icons.svg#icon-mission"></use>
</svg>
```

## Color override

All individual SVG files use `currentColor`.

```css
.mission-icon {
  color: #7fe8f4;
}
```

## Preview

Open:

`preview/index.html`

Use a local static server if your browser blocks external SVG sprite
references from `file://` pages.
