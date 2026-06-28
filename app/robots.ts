import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin"] },
    sitemap: "https://cv.libera.pro/sitemap.xml",
    host: "https://cv.libera.pro",
  };
}
