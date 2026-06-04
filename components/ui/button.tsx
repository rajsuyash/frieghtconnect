import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium font-[family-name:var(--font-heading)] cursor-pointer transition-all duration-200 ease-[var(--ease-out-expo)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-canvas)] active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-accent)] text-white shadow-[0_10px_30px_-10px_rgba(3,105,161,0.6)] hover:bg-[var(--color-accent-strong)]",
        secondary:
          "bg-white text-[var(--color-navy)] border border-[var(--color-line)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]",
        ghost:
          "bg-transparent text-[var(--color-navy)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent-strong)]",
        onDark:
          "bg-white/10 text-white border border-white/25 backdrop-blur-md hover:bg-white/20",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-13 px-8 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
