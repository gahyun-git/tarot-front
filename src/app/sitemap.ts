import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://go4it.site";
  const now = new Date().toISOString();
  const urls: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/reading/preview`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
  ];
  return urls;
}


