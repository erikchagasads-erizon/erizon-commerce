import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md";

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return cn(
    "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/60 disabled:pointer-events-none disabled:opacity-50",
    variant === "primary" &&
      "bg-orange-500 px-4 text-white shadow-glow-sm hover:bg-orange-400 active:bg-orange-600",
    variant === "secondary" &&
      "border border-white/10 bg-white/3 px-4 text-white hover:bg-white/5 hover:border-white/10",
    variant === "ghost" && "px-0 text-orange-400 hover:text-orange-300",
    size === "sm" ? "h-8 text-sm" : "h-10 text-sm",
    className,
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={buttonStyles({
        variant,
        size,
        className,
      })}
      {...props}
    />
  ),
);

Button.displayName = "Button";
