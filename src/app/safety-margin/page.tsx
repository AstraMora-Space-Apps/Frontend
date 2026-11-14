import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = { title: "Safety Margin" };

export default function Page() {
  return (
    <ComingSoon
      title="Safety Margin"
      subtitle="Preliminary comparison of oxygen limits in normal gravity and microgravity."
      milestone="M8"
    />
  );
}
