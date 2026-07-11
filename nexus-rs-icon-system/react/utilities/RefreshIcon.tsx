import { forwardRef } from "react";
import { Icon } from "../Icon";
import type { NexusIconProps } from "../icon-types";

export const RefreshIcon = forwardRef<
  SVGSVGElement,
  NexusIconProps
>(({ title = "Refresh", ...props }, ref) => (
  <Icon
    ref={ref}
    name="refresh"
    title={title}
    {...props}
  />
));

RefreshIcon.displayName = "RefreshIcon";
