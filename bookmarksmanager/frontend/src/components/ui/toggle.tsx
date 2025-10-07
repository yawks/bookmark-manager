import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"

import { cn } from "@/lib/utils";
import toggleVariants from "./toggleVariants";

const Toggle = React.forwardRef(function Toggle(props, ref) {
  return (
    <TogglePrimitive.Root
      ref={ref}
      className={cn(
        toggleVariants({
          variant: props.variant,
          size: props.size,
          className: props.className,
        })
      )}
      {...props}
    />
  );
});

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle }
