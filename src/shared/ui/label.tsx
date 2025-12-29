import * as LabelPrimitive from "@radix-ui/react-label";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@shared/lib";

type LabelProps = ComponentPropsWithoutRef<typeof LabelPrimitive.Root>;

export const Label = ({ className, ...props }: LabelProps) => {
  return (
    <LabelPrimitive.Root
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  );
};
