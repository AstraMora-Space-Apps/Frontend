import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { AskChat } from "@/components/ask/AskChat";
import { HowToRead } from "@/components/ask/HowToRead";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = pageMetadata({
  title: "Ask FlameSight",
  description:
    "Ask a fire-safety question and get an answer grounded in NASA PSI research, with sources.",
});

export default function AskPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-14">
      <PageHeader
        title="Ask FlameSight"
        subtitle="Answers come only from retrieved NASA PSI research, with sources."
      />
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <AskChat />
        </div>
        <aside aria-label="How to read an answer" className="pb-10">
          <HowToRead />
        </aside>
      </div>
    </div>
  );
}
