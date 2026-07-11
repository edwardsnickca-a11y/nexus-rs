import { forwardRef } from "react";
import { Icon } from "../Icon";
import type { NexusIconProps } from "../icon-types";

export const CollapseIcon = forwardRef<
  SVGSVGElement,
  NexusIconProps
>(({ title = "Collapse", ...props }, ref) => (
  <Icon
    ref={ref}
    name="collapse"
    title={title}
    {...props}
  />
));

CollapseIcon.displayName = "CollapseIcon";
