import { BookOpen, FlaskConical, SearchX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";

const ITEMS = [
  {
    icon: BookOpen,
    title: "Sources",
    body: "Each answer lists the papers and pages it came from. Open a source to read the quoted passage.",
  },
  {
    icon: FlaskConical,
    title: "Evidence badge",
    body: "How many tests support the answer, the platform they ran on (ISS or drop tower), and how many times they were repeated.",
  },
  {
    icon: SearchX,
    title: "Not in the data",
    body: "When the indexed research has no supporting evidence, FlameSight says so instead of guessing.",
  },
] as const;

function HowToRead() {
  return (
    <Card className="lg:sticky lg:top-24">
      <CardTitle>How to read an answer</CardTitle>
      <ul className="mt-4 space-y-4">
        {ITEMS.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex gap-3">
            <Icon className="mt-1 size-5 shrink-0 text-cyan" aria-hidden />
            <div>
              <p className="font-semibold text-foreground">{title}</p>
              <p className="text-base text-muted-foreground">{body}</p>
            </div>
          </li>
        ))}
      </ul>
      <Badge variant="preliminary" className="mt-5">
        v0.1 · preliminary / unverified
      </Badge>
    </Card>
  );
}

export { HowToRead };
