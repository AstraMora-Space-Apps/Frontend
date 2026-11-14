import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL, REQUEST_TIMEOUT_MS, isStubMode } from "@/lib/api";
import { ContractChecks } from "./ContractChecks";

export const metadata: Metadata = {
  title: "Data contract check (dev)",
  robots: { index: false, follow: false },
};

/** Local-only verification of src/lib/api.ts. Never linked from the nav. 404 in production. */
export default function ContractPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <PageHeader
        title="Data contract check"
        subtitle="Calls every function in src/lib/api.ts through the React Query hooks and validates the result with the zod schemas."
        actions={
          <>
            <Badge variant={isStubMode ? "preliminary" : "cyan"}>
              Mode: {isStubMode ? "stub" : "live"}
            </Badge>
            <Badge>Timeout: {REQUEST_TIMEOUT_MS / 1000} s</Badge>
          </>
        }
      />
      <p className="mt-4 text-base text-muted-foreground">
        API base URL: <code className="text-foreground">{API_BASE_URL || "(not set)"}</code>
      </p>
      <ContractChecks />
    </div>
  );
}
