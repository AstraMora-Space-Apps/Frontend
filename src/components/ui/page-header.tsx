import * as React from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  /** Optional element shown next to the title (e.g. a status badge). */
  titleAdornment?: React.ReactNode;
  /** Optional right-hand slot (badges, actions). */
  actions?: React.ReactNode;
  className?: string;
};

function PageHeader({ title, subtitle, titleAdornment, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {titleAdornment ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <h1>{title}</h1>
            {titleAdornment}
          </div>
        ) : (
          <h1>{title}</h1>
        )}
        {subtitle ? (
          <p className="mt-3 max-w-3xl text-lg text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export { PageHeader };
export type { PageHeaderProps };
