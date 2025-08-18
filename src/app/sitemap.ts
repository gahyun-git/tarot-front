import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://go4it.site";
  const now = new Date().toISOString();
  const urls: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/cards`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteUrl}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/disclaimer`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/content`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    // 카드 상세(78장): 인덱싱은 가볍게 우선도 낮게 제공
    ...Array.from({ length: 78 }).map((_, i) => ({
      url: `${siteUrl}/cards/${i + 1}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.2,
    })),
  ];

  const langs = ["ko", "en", "ja", "zh"] as const;
  const contentSlugs = [
    "spread/three-cards",
    "spread/eight-positions",
    "guide/getting-started",
    "guide/spreads",
  ];
  for (const slug of contentSlugs) {
    for (const lang of langs) {
      urls.push({
        url: `${siteUrl}/content/${slug}?lang=${lang}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  }
  return urls;
}


