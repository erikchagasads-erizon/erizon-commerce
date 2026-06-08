import * as React from "react";

import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-xs font-medium uppercase tracking-[0.18em] text-orange-400",
        className,
      )}
      {...props}
    />
  );
}
