import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  // Статичные страницы. CV-варианты — динамические, индексировать базовый URL.
  return [
    {
      url: "https://cv.example.com",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
