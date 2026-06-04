import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

/** Base text input. Label lives above (never placeholder-as-label). */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-11 w-full rounded-xl border border-[var(--color-line)] bg-white px-4 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-faint)] transition-colors duration-200 focus-visible:border-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/25",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
