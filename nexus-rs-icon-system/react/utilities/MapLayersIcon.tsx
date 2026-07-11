import { forwardRef } from "react";
import { Icon } from "../Icon";
import type { NexusIconProps } from "../icon-types";

export const MapLayersIcon = forwardRef<
  SVGSVGElement,
  NexusIconProps
>(({ title = "Map Layers", ...props }, ref) => (
  <Icon
    ref={ref}
    name="map-layers"
    title={title}
    {...props}
  />
));

MapLayersIcon.displayName = "MapLayersIcon";
