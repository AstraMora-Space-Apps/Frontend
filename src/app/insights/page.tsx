import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = { title: "Insights" };

export default function Page() {
  return (
    <ComingSoon
      title="Insights"
      subtitle="Ranked fire-safety insights by safety impact, evidence strength and mission relevance."
      milestone="M6"
    />
  );
}
