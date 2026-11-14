import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = { title: "Explore research" };

export default function Page() {
  return (
    <ComingSoon
      title="Explore research"
      subtitle="Browse investigations, filter by fuel, oxygen and pressure, and compare experiments."
      milestone="M4"
    />
  );
}
