import { forwardRef } from "react";
import { Icon } from "../Icon";
import type { NexusIconProps } from "../icon-types";

export const UpadStatusIcon = forwardRef<
  SVGSVGElement,
  NexusIconProps
>(({ title = "UPAD Status", ...props }, ref) => (
  <Icon
    ref={ref}
    name="upad-status"
    title={title}
    {...props}
  />
));

UpadStatusIcon.displayName = "UpadStatusIcon";
