import { forwardRef } from "react";
import { Icon } from "../Icon";
import type { NexusIconProps } from "../icon-types";

export const ExpandIcon = forwardRef<
  SVGSVGElement,
  NexusIconProps
>(({ title = "Expand", ...props }, ref) => (
  <Icon
    ref={ref}
    name="expand"
    title={title}
    {...props}
  />
));

ExpandIcon.displayName = "ExpandIcon";
