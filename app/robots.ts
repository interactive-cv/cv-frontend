import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin"] },
    sitemap: "https://cv.example.com/sitemap.xml",
    host: "https://cv.example.com",
  };
}
