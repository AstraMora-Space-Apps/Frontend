import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/metadata";

const ROUTES = ["/", "/ask", "/explore", "/coverage", "/safety-margin", "/insights", "/about"];

/** Lists the public routes. Empty when NEXT_PUBLIC_SITE_URL is not set (no absolute URLs). */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  if (!base) return [];
  return ROUTES.map((path) => ({ url: new URL(path, base).toString() }));
}
