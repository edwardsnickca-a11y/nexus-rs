import { forwardRef } from "react";
import { Icon } from "../Icon";
import type { NexusIconProps } from "../icon-types";

export const AirspaceIcon = forwardRef<
  SVGSVGElement,
  NexusIconProps
>(({ title = "Airspace", ...props }, ref) => (
  <Icon
    ref={ref}
    name="airspace"
    title={title}
    {...props}
  />
));

AirspaceIcon.displayName = "AirspaceIcon";
