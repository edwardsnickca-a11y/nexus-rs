import { forwardRef } from "react";
import { Icon } from "../Icon";
import type { NexusIconProps } from "../icon-types";

export const MenuIcon = forwardRef<
  SVGSVGElement,
  NexusIconProps
>(({ title = "Menu", ...props }, ref) => (
  <Icon
    ref={ref}
    name="menu"
    title={title}
    {...props}
  />
));

MenuIcon.displayName = "MenuIcon";
