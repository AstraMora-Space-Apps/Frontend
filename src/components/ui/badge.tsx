import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-pill border px-3 py-1 text-sm font-medium whitespace-nowrap [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-border bg-surface-raised text-foreground",
        ember: "border-ember/50 bg-ember/10 text-ember",
        cyan: "border-cyan/50 bg-cyan/10 text-cyan",
        preliminary: "border-ember-glow/50 bg-ember-glow/10 text-ember-glow",
        reviewed: "border-risk-low/50 bg-risk-low/10 text-risk-low",
        "risk-high": "border-risk-high/60 bg-risk-high/10 text-risk-high",
        "risk-medium": "border-risk-medium/60 bg-risk-medium/10 text-risk-medium",
        "risk-low": "border-risk-low/60 bg-risk-low/10 text-risk-low",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

type BadgeProps = React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

/**
 * Colour is never the only signal: risk / reviewed / preliminary variants must
 * always carry readable text (and ideally an icon) as children.
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
export type { BadgeProps };
