import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = { title: "Ask FlameSight" };

export default function Page() {
  return (
    <ComingSoon
      title="Ask FlameSight"
      subtitle="Ask a question about microgravity combustion research and get an answer with citations."
      milestone="M3"
    />
  );
}
