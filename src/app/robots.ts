import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/metadata";

/** Public site: everything may be crawled except the local-only dev routes. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/dev/" },
    ...(SITE_URL ? { sitemap: new URL("/sitemap.xml", SITE_URL).toString() } : {}),
  };
}
