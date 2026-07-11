import { forwardRef } from "react";
import { Icon } from "../Icon";
import type { NexusIconProps } from "../icon-types";

export const ProductsIcon = forwardRef<
  SVGSVGElement,
  NexusIconProps
>(({ title = "Products", ...props }, ref) => (
  <Icon
    ref={ref}
    name="products"
    title={title}
    {...props}
  />
));

ProductsIcon.displayName = "ProductsIcon";
