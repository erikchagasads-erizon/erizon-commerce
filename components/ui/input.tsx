import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg border border-white/7 bg-white/3 px-3.5 text-sm text-white outline-none transition placeholder:text-stone-600 focus:border-orange-500/40 focus:bg-white/4 focus:ring-1 focus:ring-orange-500/20",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
