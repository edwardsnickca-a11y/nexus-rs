import { forwardRef } from "react";
import { Icon } from "../Icon";
import type { NexusIconProps } from "../icon-types";

export const HistoryIcon = forwardRef<
  SVGSVGElement,
  NexusIconProps
>(({ title = "History", ...props }, ref) => (
  <Icon
    ref={ref}
    name="history"
    title={title}
    {...props}
  />
));

HistoryIcon.displayName = "HistoryIcon";
