# NEXUS RS Icon System

## 1. Visual language

The NEXUS RS icon family uses compact geometric structures derived from
mission boards, command nodes, airspace sectors, ISR platforms, processing
frames, operational timelines, and authorization records.

The family is intentionally restrained. It avoids consumer-software
metaphors, decorative detail, cartoon forms, glossy treatments, shadows,
gradients, and gaming-style targeting graphics.

Navigation icons communicate domain concepts. Utility icons use more familiar
actions but retain the same technical stroke, square terminal treatment, and
compact proportions.

### Core characteristics

- Technical and operational
- Thin-to-medium monoline construction
- Predominantly orthogonal geometry
- Restrained diagonals
- Open negative space
- Limited use of circles
- Recognizable at 20–24 px
- No filled background inside source SVGs
- No embedded color beyond `currentColor`

## 2. Grid and construction

### Canvas

Every source icon uses:

- Canvas: 24 × 24 px
- View box: `0 0 24 24`
- Optical safe area: approximately x/y 2–22
- Default stroke: 1.5 px
- Default optical padding: 2 px
- Standard corner radius: 1 px
- Maximum structural radius: 2 px

### Alignment

Prefer whole-pixel coordinates for primary structures. Half-pixel placement
may be used when needed to optically center a 1.5 px stroke.

Do not mechanically center every shape. Balance the visible stroke mass,
especially for aircraft silhouettes, angled routes, and asymmetric status
markers.

### Line treatment

- Square line caps
- Round joins only where a sharp join causes artifacts
- No variable-width decorative strokes
- No more than two hierarchy levels in one icon
- Secondary marks should remain clearly subordinate

### Spacing

Maintain at least 1.5 px between separate strokes whenever possible. Avoid
dense intersections that collapse at 20 px.

Use repeated spacing increments of 2, 3, or 4 px. Avoid arbitrary fractional
gaps unless they provide necessary optical correction.

### Curves and circles

Use circles mainly for nodes, status points, and search or zoom functions.
Avoid soft rounded geometry as the dominant visual language.

### Diagonals

Use diagonals for routes, aircraft profiles, authorization marks, transfer,
and directional action. Keep diagonal angles consistent within a single icon.

## 3. Color and interaction states

### Source SVG

All individual source files use:

`stroke="currentColor"`

This allows the host interface to control color through CSS.

### Approved colors

- Primary cyan: `#7FE8F4`
- Secondary white: `#FFFFFF`
- Dark background 900: `#081320`
- Dark background 800: `#0F1A28`
- Dark background 700: `#142535`

### Default

- Cyan stroke
- Transparent background
- Full opacity

### Hover

- Brighter cyan: `#A2F3FA`
- Optional 6% cyan background
- No scaling or geometry changes

### Selected

- Preserve the original icon geometry
- Use a 32 × 32 state container
- Use approximately 14% cyan background
- Optional 16% cyan border

### Disabled

- Preserve the original color and geometry
- Reduce container opacity to 36%
- Do not blur or desaturate

## 4. Naming

### SVG

Lowercase kebab case:

`current-ops.svg`

### Sprite

Prefix the slug with `icon-`:

`icon-current-ops`

### React

PascalCase plus `Icon`:

`CurrentOpsIcon`

### Figma

Use slash-separated category names:

`Navigation/Current Ops`

Recommended master set:

`NEXUS RS/Icon`

Recommended properties:

- Category
- Name
- State
- Color
- Size

## 5. Creating future icons

Before adding a new icon, confirm:

1. It represents an operational concept rather than a consumer metaphor.
2. Its silhouette is distinct from existing navigation icons.
3. It is recognizable at 20 px.
4. It uses the 1.5 px shared stroke.
5. It remains inside the optical safe area.
6. Its weight matches adjacent icons.
7. It works in cyan and white.
8. It does not depend on a background fill.
9. It contains no gradients, shadows, raster images, or editor metadata.
10. Its SVG, sprite, React, and Figma names follow the same slug.
11. It remains understandable without a text label.
12. It has been reviewed on all three approved dark backgrounds.

## 6. Figma import and component assembly

Import the individual SVG folders into separate Figma sections:

- Navigation
- Utilities

Convert each imported SVG into a 24 × 24 component. Preserve vectors and do
not flatten them.

Create a shared 32 × 32 state container component with these variants:

- Default
- Hover
- Selected
- Disabled

Nest icon instances inside the state container. Expose icon selection through
an instance-swap property. Expose color through a variable or component
property.

Suggested master component properties:

- Category: Navigation | Utility
- Icon: instance swap
- State: Default | Hover | Selected | Disabled
- Color: Cyan | White
- Size: 24

The selected-state background belongs to the container, not the source SVG.
