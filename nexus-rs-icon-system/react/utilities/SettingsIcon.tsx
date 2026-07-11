import { forwardRef } from "react";
import { Icon } from "../Icon";
import type { NexusIconProps } from "../icon-types";

export const SettingsIcon = forwardRef<
  SVGSVGElement,
  NexusIconProps
>(({ title = "Settings", ...props }, ref) => (
  <Icon
    ref={ref}
    name="settings"
    title={title}
    {...props}
  />
));

SettingsIcon.displayName = "SettingsIcon";
