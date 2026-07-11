import { forwardRef } from "react";
import { Icon } from "../Icon";
import type { NexusIconProps } from "../icon-types";

export const ZoomIcon = forwardRef<
  SVGSVGElement,
  NexusIconProps
>(({ title = "Zoom", ...props }, ref) => (
  <Icon
    ref={ref}
    name="zoom"
    title={title}
    {...props}
  />
));

ZoomIcon.displayName = "ZoomIcon";
