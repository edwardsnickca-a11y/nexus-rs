import { forwardRef } from "react";
import { Icon } from "../Icon";
import type { NexusIconProps } from "../icon-types";

export const HelpIcon = forwardRef<
  SVGSVGElement,
  NexusIconProps
>(({ title = "Help", ...props }, ref) => (
  <Icon
    ref={ref}
    name="help"
    title={title}
    {...props}
  />
));

HelpIcon.displayName = "HelpIcon";
