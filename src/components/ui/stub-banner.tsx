import { TriangleAlert } from "lucide-react";
import { isStubMode } from "@/lib/api";

/** Visible whenever stub mode is on (Hard rule 10). Env var is inlined at build time. */
function StubBanner() {
  if (!isStubMode) return null;
  return (
    <div
      role="status"
      className="border-b border-risk-medium/50 bg-risk-medium/10 px-4 py-2 text-center text-base font-semibold text-risk-medium"
    >
      <TriangleAlert className="mr-2 inline size-5 align-[-0.2em]" aria-hidden />
      Stub data: SAMPLE, not real data
    </div>
  );
}

export { StubBanner };
