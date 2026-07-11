import { forwardRef } from "react";
import { Icon } from "../Icon";
import type { NexusIconProps } from "../icon-types";

export const UploadIcon = forwardRef<
  SVGSVGElement,
  NexusIconProps
>(({ title = "Upload", ...props }, ref) => (
  <Icon
    ref={ref}
    name="upload"
    title={title}
    {...props}
  />
));

UploadIcon.displayName = "UploadIcon";
