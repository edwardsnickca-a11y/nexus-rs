import { forwardRef } from "react";
import { Icon } from "../Icon";
import type { NexusIconProps } from "../icon-types";

export const NotificationsIcon = forwardRef<
  SVGSVGElement,
  NexusIconProps
>(({ title = "Notifications", ...props }, ref) => (
  <Icon
    ref={ref}
    name="notifications"
    title={title}
    {...props}
  />
));

NotificationsIcon.displayName = "NotificationsIcon";
