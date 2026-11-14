import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = { title: "Coverage Map" };

export default function Page() {
  return (
    <ComingSoon
      title="Coverage Map"
      subtitle="Where tests have been run in oxygen and pressure, against habitat atmospheres."
      milestone="M5"
    />
  );
}
