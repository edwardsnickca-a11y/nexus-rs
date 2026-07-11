import { forwardRef } from "react";
import { Icon } from "../Icon";
import type { NexusIconProps } from "../icon-types";

export const RequirementsIcon = forwardRef<
  SVGSVGElement,
  NexusIconProps
>(({ title = "Requirements", ...props }, ref) => (
  <Icon
    ref={ref}
    name="requirements"
    title={title}
    {...props}
  />
));

RequirementsIcon.displayName = "RequirementsIcon";
