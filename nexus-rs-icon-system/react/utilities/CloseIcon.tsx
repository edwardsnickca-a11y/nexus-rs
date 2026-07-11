import { forwardRef } from "react";
import { Icon } from "../Icon";
import type { NexusIconProps } from "../icon-types";

export const CloseIcon = forwardRef<
  SVGSVGElement,
  NexusIconProps
>(({ title = "Close", ...props }, ref) => (
  <Icon
    ref={ref}
    name="close"
    title={title}
    {...props}
  />
));

CloseIcon.displayName = "CloseIcon";
