import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full text-xs font-medium font-[family-name:var(--font-heading)] leading-none",
  {
    variants: {
      variant: {
        neutral:
          "bg-[var(--color-canvas)] text-[var(--color-muted)] border border-[var(--color-line)]",
        accent: "bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]",
        verified: "bg-[var(--color-verified-soft)] text-[var(--color-verified)]",
        onDark: "bg-white/10 text-white border border-white/20",
      },
      size: {
        sm: "px-2.5 py-1",
        md: "px-3 py-1.5",
      },
    },
    defaultVariants: { variant: "neutral", size: "sm" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}
