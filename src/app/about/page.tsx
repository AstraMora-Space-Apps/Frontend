import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = { title: "About FlameSight" };

export default function Page() {
  return (
    <ComingSoon
      title="About FlameSight"
      subtitle="How FlameSight works, its data sources, and its limits."
      milestone="M6"
    />
  );
}
