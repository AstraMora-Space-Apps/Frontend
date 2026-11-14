import { Construction } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

type ComingSoonProps = {
  title: string;
  subtitle: string;
  milestone: string;
};

/** Shell page placeholder. No fake data. */
function ComingSoon({ title, subtitle, milestone }: ComingSoonProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={<Badge variant="preliminary">v0.1 · preliminary / unverified</Badge>}
      />
      <Card className="mt-8 flex items-start gap-4">
        <Construction className="mt-1 size-7 shrink-0 text-ember-glow" aria-hidden />
        <div>
          <CardTitle>Coming in a later milestone</CardTitle>
          <CardDescription>
            This page is part of {milestone}. The shell is in place; content arrives next.
          </CardDescription>
        </div>
      </Card>
    </div>
  );
}

export { ComingSoon };
