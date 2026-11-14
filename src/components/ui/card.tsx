import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva("rounded-card border p-6 text-card-foreground", {
  variants: {
    variant: {
      default: "border-border bg-surface",
      raised: "border-border bg-surface-raised shadow-lg shadow-black/30",
      glow: "border-ember/40 bg-surface shadow-glow",
    },
  },
  defaultVariants: { variant: "default" },
});

type CardProps = React.ComponentProps<"div"> & VariantProps<typeof cardVariants>;

function Card({ className, variant, ...props }: CardProps) {
  return <div data-slot="card" className={cn(cardVariants({ variant }), className)} {...props} />;
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return <h3 className={cn("text-xl font-bold", className)} {...props} />;
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("mt-2 text-base text-muted-foreground", className)} {...props} />;
}

export { Card, CardTitle, CardDescription, cardVariants };
